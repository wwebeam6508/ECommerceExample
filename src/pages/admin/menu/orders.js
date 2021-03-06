import React, { useEffect, useRef, useState } from "react"
import { Button, Container, Form, Nav, Navbar, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../../redux/slices/authSlice"
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore"
import Receipt from "./components/receipt"
import ReactToPrint, { PrintContextConsumer } from "react-to-print"

export default function Orders() {
    const [success, setSuccess] = useState(false)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()
    const [orders, setOrders] = useState([])
    const [receipt, setReceipt] = useState([])
    const componentRef = useRef([])
    useEffect(()=>{
        async function init() {
            await getOrders()
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
                        <Nav.Link onClick={()=>{history.goBack()}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>ชื่อสินค้า</th>
                        <th>สั่งโดย</th>
                        <th>ประเภทสินค้า</th>
                        <th>ราคา</th>
                        <th>จำนวน</th>
                        <th>สถานะ</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orders && orders.map((order,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td className="clicktoview" onClick={()=>{history.push({pathname:'/productView',state:order})}}>{order.name}</td>
                                        <td>{order.byName}</td>
                                        <td>{order.typeName}</td>
                                        <td>{order.price}</td>
                                        <td>{order.count}</td>
                                        <td>กำลังรออนุมัติ</td>
                                        <td><Button onClick={()=>{acceptToReceipt(order.uid)}}>อนุมัติ</Button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>ชื่อสินค้า</th>
                        <th>สั่งโดย</th>
                        <th>ประเภทสินค้า</th>
                        <th>ราคา</th>
                        <th>จำนวน</th>
                        <th>สถานะ</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            receipt && receipt.map((re,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td className="clicktoview" onClick={()=>{history.push({pathname:'/productView',state:re})}}>{re.name}</td>
                                        <td>{re.byName}</td>
                                        <td>{re.typeName}</td>
                                        <td>{re.price}</td>
                                        <td>{re.count}</td>
                                        <td>อนุมัติแล้ว</td>
                                        <td>
                                            <ReactToPrint content={() => {
                                                return componentRef.current[index];
                                            }}>
                                                <PrintContextConsumer>
                                                    {({ handlePrint }) => (
                                                        <Button onClick={()=>{handlePrint()}}>Print ใบเสร็จ</Button>
                                                    )}
                                                </PrintContextConsumer>
                                            </ReactToPrint>
                                            <div style={{ display: "none" }}>
                                                <Receipt order={re} ref={(el) => (componentRef.current[index] = el)} />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </>
    )

    async function getOrders() {
        setSuccess(false)
        const db = getFirestore()
        const orderRef = collection(db, 'orders')
        const orderQuery = query(orderRef, where('status', '==', '1'))
        const orderData = (await getDocs(orderQuery))
        setOrders([])
        orderData.forEach(async (res)=>{
            const data = res.data()
            const type_name = (await getDoc(doc(db, 'productType', data.type))).data().name
            const userDetail = (await getDoc(doc(db, 'users', data.byUID))).data()
            setOrders(prevForm=>[
                ...prevForm,
                {
                    name: data.name,
                    type: data.type,
                    typeName: type_name,
                    detail: data.detail,
                    price: data.price,
                    uid: res.id,
                    count: data.count,
                    byUID: data.byUID,
                    byName: userDetail.name,
                    status: data.status
                }
            ])
        })

        const recieptQuery = query(orderRef, where('status', '==', '2'))
        const recieptData = (await getDocs(recieptQuery))
        componentRef.current = componentRef.current.slice(0, recieptData.size)
        setReceipt([])
        recieptData.forEach(async (res)=>{
            const data = res.data()
            const type_name = (await getDoc(doc(db, 'productType', data.type))).data().name
            const userDetail = (await getDoc(doc(db, 'users', data.byUID))).data()
            setReceipt(prevForm=>[
                ...prevForm,
                {
                    name: data.name,
                    type: data.type,
                    typeName: type_name,
                    detail: data.detail,
                    price: data.price,
                    uid: res.id,
                    count: data.count,
                    byUID: data.byUID,
                    byName: userDetail.name,
                    byAddress: userDetail.address,
                    byPhone: userDetail.phoneNumber,
                    status: data.status
                }
            ])
        })
        setSuccess(true)
    }

    async function acceptToReceipt(uid) {
        setSuccess(false)
        const db = getFirestore()
        const orderRef = doc(db, 'orders', uid)
        await updateDoc(orderRef, {
            status: "2"
        }).then(async ()=>{
            MySwal.fire({
                icon: 'success',
                title: `อนุมัติการสั่งซื้อสำเร็จ`
            })
            await getOrders()
            setSuccess(true)

        }).catch((error)=>{
            MySwal.fire({
                icon: 'error',
                title: `อนุมัติการสั่งซื้อ`,
                text: error.message
            })
            setSuccess(true)
        })
    }
}
