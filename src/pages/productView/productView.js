import React, { useEffect, useState } from "react"
import { Button, Col, Container, Form, Nav, Navbar, Row } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../redux/slices/authSlice"
import { doc, getDoc, getFirestore } from "firebase/firestore"

export default function ProductView() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()
    
    const paramData = history.location.state
    const [images, setImages] = useState([])
    useEffect(()=>{
        async function init() {
            await getProductImages()
            setSuccess(true)
        }
        init()
    },[])
    
    return(
        !success ?
        <Container className="center-screen">
            Loading
        </Container>
        :
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand onClick={()=>{history.push('/')}}>จัดการรายการสั่งซื้อ</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.push('/home')}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <div className="position-relative overflow-hidden p-3 p-md-5 m-md-3 text-center bg-light">
                    <div className="col-md-5 p-lg-5 mx-auto my-5">
                        <h1 className="display-4 font-weight-normal">{paramData.name}</h1>
                        <p className="lead font-weight-normal">{paramData.detail}</p>
                        <a className="btn btn-outline-secondary" >ใส่ลงตระก้า</a>
                    </div>
                    <div className="product-device box-shadow d-none d-md-block"></div>
                    <div className="product-device product-device-2 box-shadow d-none d-md-block"></div>
                </div>
                <Row>
                    {
                        images && images.map((image,index)=>{
                            return(
                                <Col key={index} sm={6}>
                                    <img src={image}  height="400px"></img>
                                </Col>
                            )
                        })
                    }
                </Row>
            </Container>
        </>
    )

    async function getProductImages() {
        const db = getFirestore()
        const productRef = doc(db, 'products', paramData.uid)
        const productData = await getDoc(productRef)
        setImages(productData.data().images)
    }
}