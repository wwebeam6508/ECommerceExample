import React, { useEffect, useState } from "react"
import { Button, Container, Form, Nav, Navbar, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../../redux/slices/authSlice"
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, Timestamp, where } from "firebase/firestore"
import Modal from 'react-modal'

export default function ProductType() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()
    const [modalIsOpen, setIsOpen] = useState(false)

    const [ productType, setProductType] = useState([])
    const [ productTypeModal, setProductTypeModal] = useState({
        name:""
    })
    useEffect(()=>{
        async function init() {
            await getProductType()
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
                    <Navbar.Brand onClick={()=>{history.push('/')}}>จัดการรายการประเภทสินค้า</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.goBack()}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Button onClick={openModal}>เพิ่ม</Button>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>ชื่อหมวดหมู่สินค้า</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            productType && productType.map((type,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{type.name}</td>
                                        <td>  
                                            <Button style={{backgroundColor:"red"}} onClick={()=>{deleteProductType(type.uid)}}>ลบ</Button>
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
                <h2 >เพิ่มหมวดหมู่สินค้า</h2>
                <button onClick={closeModal}>close</button>
                <Container style={{marginTop:"10px"}}>
                <Form>
                    <Form.Group className="mb-3" controlId="Typename">
                        <Form.Label>ชื่อหมวดหมู่</Form.Label>
                        <Form.Control type="name" placeholder="Enter name" value={productTypeModal.name} onChange={(e)=>{
                            setProductTypeModal(prevForm => ({
                                ...prevForm,
                                name: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Button variant="primary" type="button" onClick={async ()=>{await addProductType()}}>
                        บันทึก
                    </Button>
                </Form>
                </Container>
            </Modal>
        </>
    )
    
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
    }

    function openModal() {
        setIsOpen(true);
        setProductTypeModal({
            name:""
        })
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    async function closeModal() {
        await getProductType()
        setIsOpen(false)
    }

    async function addProductType(){
        const db = getFirestore()
        const productTypeRef = collection(db, "productType")
        await addDoc(productTypeRef, {...productTypeModal,
            dateCreated: Timestamp.fromDate(new Date())
        }).then(async ()=>{
            MySwal.fire({
                icon: 'success',
                title: `เพิ่มหมวดหมู่สินค้า`,
                text: "เพิ่มสำเร็จ"
            })
            await closeModal()
        }).catch((error)=>{
            MySwal.fire({
                icon: 'error',
                title: `เพิ่มหมวดหมู่สินค้า`,
                text: error.message
            })
        })
    }

    async function deleteProductType(uid) {
        const db = getFirestore()
        const productRef = collection(db, "products")
        const productQuery = query(productRef, where('type', '==', uid))
        const productData = await getDocs(productQuery)
        if(productData.size > 0){
            MySwal.fire({
                icon: 'warning',
                title: `มีข้อมูลสินค้าหลงเหลืออยู่`
            })
            return
        }
        MySwal.fire({
            title: 'ยืนยันการลบหมวดหมู่สินค้าออก?',
            showDenyButton: true,
            confirmButtonText: 'ยกเลิก',
            denyButtonText: `ลบ`,
        }).then(async (result) => {
            if (result.isConfirmed) {
            } else if (result.isDenied) {
                const productTypeRef = doc(db, "productType", uid)
                await deleteDoc(productTypeRef).then(async ()=>{
                    MySwal.fire({
                        icon: 'success',
                        title: `ลบหมวดหมู่สินค้า`,
                        text: `ลบสำเร็จ`
                    })
                    await getProductType()
                }).catch((error)=>{
                    MySwal.fire({
                        icon: 'error',
                        title: `ลบหมวดหมู่สินค้า`,
                        text: error.message
                    })
                })
            }
        })

        
    }
}