import React, { useEffect, useState } from "react"
import { Button, Container, Form, Nav, Navbar, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../../redux/slices/authSlice"
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, Timestamp, updateDoc, writeBatch } from "firebase/firestore"
import Modal from 'react-modal'
import './products.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAdd } from "@fortawesome/free-solid-svg-icons"
import ImageUploading from 'react-images-uploading'
import { deleteObject, getDownloadURL, getStorage, ref, uploadString } from "firebase/storage"
import isEmpty from "../../../ultis/isEmpty"

export default function Products() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const [modalIsOpen, setIsOpen] = useState(false)
    const history = useHistory()
    const dispatch = useDispatch()
    const [ products, setProducts] = useState([])
    const [ productType, setProductType] = useState([])
    const [ productModal, setProductModal] = useState({
        name:"",
        images: [],
        detail: "",
        type: "",
        price: 0
    })
    const [isEdit, setIsEdit] = useState(false)
    const [ images, setImages] = useState([])
    const [uidEdit, setUidEdit] = useState("")
    useEffect(()=>{
        async function init() {
            await getProducts()
            setSuccess(true)
        }
        init()
    },[])
    Modal.setAppElement('body')
    
    return(
        !success ?
        <Container className="center-screen">
            Loading
        </Container>
        :
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand onClick={()=>{history.push('/')}}>จัดการรายการสินค้า</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.push('/admin')}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Button onClick={async ()=>{await openModal()}}>เพิ่ม</Button>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>ชื่อสินค้า</th>
                        <th>ประเภทสินค้า</th>
                        <th>ราคา</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            products && products.map((product,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{product.name}</td>
                                        <td>{product.typeName}</td>
                                        <td>{product.price}</td>
                                        <td>  
                                            <Button style={{backgroundColor:"green"}} onClick={async ()=>{await openEdit(product.uid); setIsEdit(true)}}>แก้ไข</Button>
                                            <Button style={{marginLeft: "10px",backgroundColor:"red"}} onClick={async ()=>{await deleteProduct(product.uid)}}>ลบ</Button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                contentLabel="ProductType"
            >
                <h2 >
                    {
                        isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'
                    }
                </h2>
                <button onClick={closeModal}>close</button>
                <Container style={{marginTop:"10px"}}>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>ชื่อสินค้า</Form.Label>
                        <Form.Control type="text" placeholder="Enter name" value={productModal.name} onChange={(e)=>{
                            setProductModal(prevForm => ({
                                ...prevForm,
                                name: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>หมวดหมู่สินค้า</Form.Label>
                        <Form.Select aria-label="หมวดหมู่สินค้า" value={productModal.type} onChange={(e)=>{
                            console.log(e.target.value)
                            setProductModal(prevForm => ({
                                ...prevForm,
                                type: e.target.value
                            }))
                        }}>
                            {
                                productType && productType.map((type, index)=>{
                                    return(
                                        <option key={index} value={type.uid}>{type.name}</option>
                                    )
                                })
                            }
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicImages">
                        <div style={{display:"flex"}}>
                            <ImageUploading
                                multiple
                                value={productModal.images}
                                onChange={uploadFiles}
                                maxNumber={62}
                                dataURLKey="data_url"
                            >
                                {({
                                    imageList,
                                    onImageUpload,
                                    onImageUpdate,
                                    onImageRemove,
                                    dragProps,
                                }) => (
                                    <>
                                        {
                                            imageList.length < 4 ?
                                                <div onClick={onImageUpload}
                                                {...dragProps} className="imagepicker">
                                                    <FontAwesomeIcon className="iconimage" size="8x" icon={faAdd} />
                                                </div>
                                            :
                                                <>
                                                </>
                                        }
                                        {
                                            imageList.map((image, index) => (
                                            <div key={index} className="image-item">
                                                <img src={image['data_url']} alt="" width="250px" />
                                                <div className="image-item__btn-wrapper">
                                                    <Button style={{backgroundColor:"red",marginRight:"10px"}} onClick={() => onImageRemove(index)}>ลบ</Button>
                                                    <Button style={{backgroundColor:"green"}} onClick={() => onImageUpdate(index)}>แก้ไข</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </ImageUploading>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicDetail">
                        <Form.Label>รายละเอียด</Form.Label>
                        <Form.Control value={productModal.detail} onChange={(e)=>{
                            setProductModal(prevForm => ({
                                ...prevForm,
                                detail: e.target.value
                            }))
                        }} as="textarea" rows={3} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPrice">
                        <Form.Label>ราคาสินค้า</Form.Label>
                        <Form.Control type="number" placeholder="Enter Price" value={productModal.price} onChange={(e)=>{
                            setProductModal(prevForm => ({
                                ...prevForm,
                                price: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    {
                        isEdit ?
                        <Button variant="primary" type="button" onClick={async ()=>{await editProduct()}}>
                            แก้ไข
                        </Button>
                        :
                        <Button variant="primary" type="button" onClick={async ()=>{await addProduct()}}>
                            บันทึก
                        </Button>
                    }
                </Form>
                </Container>
            </Modal>
        </>
    )
 
    function uploadFiles(imageList, addUpdateIndex) {
        setProductModal(prevForm=>({
            ...prevForm,
            images: imageList
        }))
        console.log(productModal)
    }

    async function getProducts() {
        const db = getFirestore()
        const productRef = collection(db, "products")
        const productQuery = query(productRef, orderBy("dateCreated", "desc"))
        const productDoc = await getDocs(productQuery)
        setProducts([])
        productDoc.forEach(async (res)=>{
            const type_name = (await getDoc(doc(db, 'productType', res.data().type))).data().name
            setProducts((prevForm)=>[
                ...prevForm,
                {
                    name: res.data().name,
                    type: res.data().type,
                    typeName: type_name,
                    detail: res.data().detail,
                    price: res.data().price,
                    uid: res.id
                }
            ])
        })
    }

    async function getProductType() {
        const db = getFirestore()
        const productTypeRef = collection(db, "productType")
        const productTypeQuery = query(productTypeRef, orderBy("dateCreated", "desc"))
        const productTypeDoc = await getDocs(productTypeQuery)
        const productTypelist = []
        productTypeDoc.forEach((doc)=>{
            productTypelist.push({...doc.data(),uid: doc.id})
        })
        setProductType(productTypelist)
        if(productModal.type === ""){
            setProductModal(prevForm=>({
                ...prevForm,
                type:productTypelist[0]
            }))
        }
    }

    async function uploadImage(file, uid, index) {
        const db = getFirestore()
        const storage = getStorage()
        const storageRef = ref(storage, "productimages/"+uid+"/"+index)
        await uploadString(storageRef, file, 'data_url').then(async (snapshot) => {
            await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                const productImageRef = doc(db, "products", uid)
                await updateDoc(productImageRef, {
                    images: arrayUnion(downloadURL)
                })
            })
        })
    }

    async function addProduct(){
        console.log(productModal.type)
        if(isEmpty(productModal.name)||isEmpty(productModal.type)){
            MySwal.fire({
                icon: 'warning',
                title: `เพิ่มสินค้า`,
                text: `กรุณากรอกชื่อให้สินค้า`
            })
            return
        }
        setSuccess(false)
        const db = getFirestore()
        const productRef = collection(db, "products")
        await addDoc(productRef, {
            name:productModal.name,
            detail: productModal.detail,
            type: productModal.type,
            price: productModal.price,
            dateCreated: Timestamp.fromDate(new Date())
        }).then(async (res)=>{
            let index = 0
            for (const image of productModal.images) {
                await uploadImage(image.data_url, res.id, index)
                index++
            }
            MySwal.fire({
                icon: 'success',
                title: `เพิ่มสินค้า`,
                text: "เพิ่มสำเร็จ"
            })
            setSuccess(true)
            await closeModal()
        }).catch((error)=>{
            setSuccess(true)
            MySwal.fire({
                icon: 'error',
                title: `เพิ่มสินค้า`,
                text: error.message
            })
        })
    }

    async function editProduct() {
        if(isEmpty(productModal.name)){
            MySwal.fire({
                icon: 'warning',
                title: `แก้ไขสินค้า`,
                text: `กรุณากรอกชื่อให้สินค้า`
            })
            return
        }
        setSuccess(false)
        const db = getFirestore()
        const productRef = doc(db, "products", uidEdit)
        await updateDoc(productRef, {
            name:productModal.name,
            detail: productModal.detail,
            type: productModal.type,
            price: productModal.price,
            images:[]
        }).then(async (res)=>{
            let index = 0
            for (const image of productModal.images) {
                if(image.data_url.split('/')[2]!=="firebasestorage.googleapis.com"){
                    const storage = getStorage()
                    const productimagesRef = ref(storage, "productimages/"+uidEdit+"/"+index)
                    await deleteObject(productimagesRef).catch(()=>{})
                    await uploadImage(image.data_url, uidEdit, index)
                    
                } else {
                    await updateDoc(productRef, {
                        images: arrayUnion(image.data_url)
                    })
                }
                index++
            }
            MySwal.fire({
                icon: 'success',
                title: `แก้ไขสินค้า`,
                text: "แก้ไขสำเร็จ"
            })
            setSuccess(true)
            await closeModal()
        }).catch((error)=>{
            setSuccess(true)
            MySwal.fire({
                icon: 'error',
                title: `แก้ไขสินค้า`,
                text: error.message
            })
        })
    }

    async function deleteProduct(uid) {
        MySwal.fire({
            title: 'ยืนยันการลบสินค้าออก?',
            showDenyButton: true,
            confirmButtonText: 'ยกเลิก',
            denyButtonText: `ลบ`,
        }).then(async (result) => {
            if (result.isConfirmed) {
            } else if (result.isDenied) {
                setSuccess(false)
                const db = getFirestore()
                const productRef = doc(db, "products", uid)
                const productData = await getDoc(productRef)
                const data = productData.data()
                
                for (const image of data.images) {
                    const storage = getStorage()
                    let i = 0
                    const productimagesRef = ref(storage, "productimages/"+uid+"/"+i)
                    await deleteObject(productimagesRef)
                    i++
                }
                await deleteDoc(productRef).then(async ()=>{
                    await getProducts()
                    MySwal.fire({
                        icon: 'success',
                        title: `ลบสินค้า`,
                        text: "ลบสำเร็จ"
                    })
                    setSuccess(true)
        
                }).catch((error)=>{
                    MySwal.fire({
                        icon: 'error',
                        title: `ลบสินค้า`,
                        text: error.message
                    })
                    setSuccess(true)
                })
            }
        })
    }

    async function openModal() {
        setIsOpen(true)
        await getProductType()
        setProductModal({
            name:"",
            images: [],
            detail: "",
            type: "",
            price: 0
        })
    }

    async function openEdit(uid) {
        setUidEdit(uid)
        setIsOpen(true)
        await getProductType()
        const db = getFirestore()
        const productRef = doc(db, 'products', uid)
        const productData = await getDoc(productRef)
        const data = productData.data()
        setProductModal({
            name:data.name,
            detail: data.detail,
            type: data.type,
            price: data.price
        })
        setProductModal(prevForm=>({
            ...prevForm,
            images: data.images.map((image)=>{
                return {
                    data_url: image
                }
            })
        }))
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    async function closeModal() {
        await getProducts()
        setIsOpen(false)
        setIsEdit(false)
    }
}