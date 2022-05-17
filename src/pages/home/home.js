
import React, { useEffect, useState } from "react"
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap'
import './home.scss'
import istockphoto from '../../assets/istockphoto.jpg'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { signOutApp, getUser } from "../../../src/redux/slices/authSlice"
import { getAuth, signOut} from "firebase/auth"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"
import { collection, doc, endAt, getDoc, getDocs, getFirestore, limit, orderBy, query, startAfter, startAt, where } from "firebase/firestore"
import Modal from 'react-modal'
import isEmpty from "../../ultis/isEmpty"
import Pagination from "react-js-pagination"
export default function Home() {
    const MySwal = withReactContent(Swal)
    const dispatch = useDispatch()
    const history = useHistory()
    const [success, setSuccess] = useState(false)
    let user_detail = useSelector(getUser)

    const [productType, setProductType] = useState("")
    const [ searchProductName, setSearchProductName ] = useState("")
    const [productTypeList, setProductTypeList] = useState("")
    const [products, setProducts] = useState([])

    const [activePage, setActivePage] = useState(1)

    const [ totalProductCount , setTotalProductCount] = useState(0)
    
    useEffect(()=>{
        async function init() {
            await getProducts()
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
                <Navbar.Brand onClick={()=>{history.push('/')}}>ECommerce Raj</Navbar.Brand>
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
            <form action="#">
                <div className="row" style={{textAlign:"center"}}>
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-12 p-0">
                                <input value={searchProductName} onChange={(e)=>{setSearchProductName(e.target.value)}} placeholder="ค้นหาสินค้า" className="form-control search-slt" id="exampleFormControlSelect1"/>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12 p-0">
                                <select value={productType} onChange={(e)=>{
                                    setProductType(e.target.value)
                                }} className="form-control search-slt" id="exampleFormControlSelect1">
                                    <option value={""}>ทั้งหมด</option>
                                    {
                                        productTypeList && productTypeList.map((type,index)=>{
                                            return(
                                                <option key={index} value={type.uid}>{type.name}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12 p-0">
                                <button onClick={async ()=>{ await getProducts()}} type="button" className="btn btn-primary wrn-btn">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
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
            {/* <Pagination
                activePage={activePage}
                itemsCountPerPage={8}
                totalItemsCount={totalProductCount}
                pageRangeDisplayed={5}
                onChange={onChangePageProduct}
            /> */}
        </Container>
        </>
    )

    async function onChangePageProduct(pageNumber) {
        setActivePage(pageNumber)
        await getProducts()
    }

    async function getProducts() {
        const db = getFirestore()
        const productRef = collection(db, 'products')
        let productWhere = query(productRef , orderBy('name'))
        if(!isEmpty(searchProductName)){
            productWhere = query(productWhere , where('name', '>=', searchProductName))
            productWhere = query(productWhere , where('name', '<=', searchProductName+ '\uf8ff'))
        }
        if(productType !== ''){
            productWhere = query(productWhere, where('type','==',productType))
        }
        // const productLast = query(productWhere, orderBy('dateCreated', 'desc'), startAfter((activePage-1)*8), limit(8))
        const productData = await getDocs(productWhere)
        setProducts([])
        // setTotalProductCount((await getDocs(productWhere)).size)
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

    async function getProductType() {
        const db = getFirestore()
        const productTypeRef = collection(db, 'productType')

        const productTypeData = await getDocs(productTypeRef)
        setProductTypeList([])
        productTypeData.forEach(async (res)=>{
            const data = res.data()
            setProductTypeList(prevForm=>[
                ...prevForm,
                {
                    name: data.name,
                    uid: res.id
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