
import React, { useEffect, useState } from "react"
import { Navbar, Container, Nav, NavDropdown,Card,Button } from 'react-bootstrap'
import './home.scss'
import istockphoto from '../../assets/istockphoto.jpg'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { signOutApp, getUser } from "../../../src/redux/slices/authSlice"
import { getAuth, signOut} from "firebase/auth"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import Modal from 'react-modal'
export default function Home() {
    const MySwal = withReactContent(Swal)
    const dispatch = useDispatch()
    const history = useHistory()
    const [success, setSuccess] = useState(false)
    let user_detail = useSelector(getUser)

    const [productType, setProductType] = useState("")
    const [products, setProducts] = useState([])
    const [ modalIsOpen, setIsOpen] = useState(false)

    const [ productModal , setProductModal] = useState({
        name: "",
        type: "",
        typeName: "",
        detail: "",
        price: "",
        uid: "",
        images: []
    })
    
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
                <Navbar.Brand onClick={()=>{history.push('/')}}>ECommerce Fai</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link onClick={()=>{history.push("/home")}}>หน้าสินค้า</Nav.Link>
                    <Nav.Link onClick={()=>{history.push("/cart")}}>ตระก้า</Nav.Link>
                    <NavDropdown className="rightbar" title="ตั้งค่า" id="basic-nav-dropdown">
                        <NavDropdown.Item onClick={()=>{history.push("/setting")}}>แก้ไขโปรไฟล์</NavDropdown.Item>
                        <NavDropdown.Item onClick={()=>{signOutBoi()}}>Logout</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Container style={{height:"100%",width:"100%",marginTop:"2%"}}>
            <ul className="cards">
                {
                    products && products.map((product, index)=>{
                        return(
                            <li key={index} onClick={()=>{history.push({pathname:'/productView',state:product})}}>
                                <a className="card">
                                <img src={product.image} className="card__image" alt="" />
                                <div className="card__overlay">
                                    <div className="card__header">
                                    <div className="card__header-text">
                                        <h3 className="card__title">{product.name}</h3>            
                                        <span className="card__status">{product.typeName}</span>
                                    </div>
                                    </div>
                                    <p className="card__description">{product.detail}</p>
                                </div>
                                </a>      
                            </li>
                        )
                    })
                }
            </ul>
        </Container>
        </>
    )

    async function getProducts() {
        const db = getFirestore()
        const productRef = collection(db, 'products')
        const productQuery = query(productRef, orderBy('dateCreated', 'desc'))
        let productWhere = productQuery
        if(productType !== ''){
            productWhere = query(productQuery, where('type','==',productType))
        }
        const productData = await getDocs(productWhere)
        setProducts([])
        productData.forEach(async (res)=>{
            const data = res.data()
            const type_name = (await getDoc(doc(db, 'productType', data.type))).data().name
            setProducts(prevForm=>[
                ...prevForm,
                {
                    name: data.name,
                    type: data.type,
                    typeName: type_name,
                    detail: data.detail,
                    price: data.price,
                    uid: res.id,
                    image: data.images[0] ? data.images[0] : istockphoto
                }
            ])
        })
    }

    function signOutBoi() {
        
        MySwal.fire({
            title: 'ยืนยันการลงชื่อออก?',
            showDenyButton: true,
            confirmButtonText: 'ยกเลิก',
            denyButtonText: `ลงชื่อออก`,
        }).then((result) => {
            if (result.isDenied) {
                const auth = getAuth()
                signOut(auth).then(() => {
                    dispatch(signOutApp())
                    history.push("/login")
                }).catch((error) => {
                    MySwal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: `${error.message}`
                    })
                })
            }
        })
    }
}