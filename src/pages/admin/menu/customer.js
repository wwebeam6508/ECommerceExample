import React, { useEffect, useState } from "react"
import { Button, Container, Form, Nav, Navbar, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../../redux/slices/authSlice"
import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"

export default function Customer() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()
    const [ users, setUsers ] = useState([])
    useEffect(()=>{
        async function init() {
            await getUser()
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
                    <Navbar.Brand onClick={()=>{history.push('/')}}>จัดการลูกค้า</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.goBack()}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>อีเมล</th>
                        <th>ชื่อ</th>
                        <th>เบอร์โทร</th>
                        <th>เพศ</th>
                        <th>ที่อยู่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users && users.map((user,index)=>{
                                return (
                                    user_detail.email != user.email ?
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{user.email}</td>
                                        <td>{user.name}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>{user.sex}</td>
                                        <td>{user.address}</td>
                                    </tr>
                                    :
                                    <></>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </>
    )
    
    async function getUser() {
        const db = getFirestore()
        const usersRef = collection(db, "users")
        const userQuery = query(usersRef, where("userType","==","user"), orderBy("dateCreated", "desc"))
        const usersDoc = await getDocs(userQuery)
        const userlist = []
        usersDoc.forEach((doc)=>{
            userlist.push(doc.data())
        })
        setUsers(userlist)
    }
}