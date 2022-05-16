import { getAuth, signOut } from "firebase/auth"
import React from "react"
import { Button, Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { signOutApp } from "../../redux/slices/authSlice"
import './admin.scss'
export default function Admin() {
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const auth = getAuth()
    const dispatch = useDispatch()
    
    return(
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand onClick={()=>{history.push('/')}}>Admin</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown className="rightbar" title="ตั้งค่า" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={()=>{history.push("/setting")}}>แก้ไขโปรไฟล์</NavDropdown.Item>
                            <NavDropdown.Item onClick={()=>{signOutBoi()}}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="middlething" >
                <Row style={{marginTop:"25%"}}>
                    <Button className="meunuadmin" onClick={()=>{history.push('/hr')}}> จัดการพนักงาน </Button>
                    <Button className="meunuadmin" onClick={()=>{history.push('/customer')}}> ดูรายการลูกค้า </Button>
                    <Button className="meunuadmin" onClick={()=>{history.push('/productType')}}> จัดการหมวดหมู่สินค้า </Button>
                    <Button className="meunuadmin" onClick={()=>{history.push('/products')}}> จัดการสินค้า </Button>
                    <Button className="meunuadmin" onClick={()=>{history.push('/order')}}> จัดการรายการสั่งซื้อ </Button>
                </Row>
            </Container>
        </>
    )

    function signOutBoi() {
        
        MySwal.fire({
            title: 'ยืนยันการลงชื่อออก?',
            showDenyButton: true,
            confirmButtonText: 'ยกเลิก',
            denyButtonText: `ลงชื่อออก`,
        }).then((result) => {
            if (result.isConfirmed) {
            } else if (result.isDenied) {
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