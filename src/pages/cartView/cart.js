import React, { useEffect, useState } from "react"
import { Button, Container, Form, Nav, Navbar, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../redux/slices/authSlice"
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, orderBy, query, Timestamp, where } from "firebase/firestore"
import './cart.scss'
import { async } from "@firebase/util"
export default function Cart() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()

    let carts = JSON.parse(localStorage.getItem('carts'))

    const [productCart, setProductCart] = useState([])
    const [orders, setOrders] = useState([])
    useEffect(()=>{
        async function init() {
            await getProducts()
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
                        <th>ประเภทสินค้า</th>
                        <th>ราคา</th>
                        <th>จำนวน</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            productCart && productCart.map((cart,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td className="clicktoview" onClick={()=>{history.push({pathname:'/productView',state:cart})}}>{cart.name}</td>
                                        <td>{cart.typeName}</td>
                                        <td>{cart.price}</td>
                                        <td>{cart.count}</td>
                                        <td><Button style={{backgroundColor:"red"}} onClick={()=>{removeCart(cart.uid)}}>ลบ</Button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
                <Button onClick={async ()=>{await orderProduct()}}>สั่งซื้อ</Button>
            </Container>
            <Container style={{marginTop:"10px"}}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>ชื่อสินค้า</th>
                        <th>ประเภทสินค้า</th>
                        <th>ราคา</th>
                        <th>จำนวน</th>
                        <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orders && orders.map((order,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td className="clicktoview" onClick={()=>{history.push({pathname:'/productView',state:order})}}>{order.name}</td>
                                        <td>{order.typeName}</td>
                                        <td>{order.price}</td>
                                        <td>{order.count}</td>
                                        <td>{order.status === '1' ? "กำลังรออนุมัติ" : "สั่งซื้อแล้ว"}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </>
    )

    async function getProducts() {
        if(carts.length > 0){
            const cartItem = await getDistinctCarts(carts)
            const cartItemArray = cartItem.map((cart)=>{
                return cart.uid
            })
            const db = getFirestore()
            const productRef = collection(db, 'products')
            const productQuery = query(productRef, where('__name__', 'in', cartItemArray))
            const productData = await getDocs(productQuery)
            setProductCart([])
            productData.forEach(async (res)=>{
                const data = res.data()
                const type_name = (await getDoc(doc(db, 'productType', data.type))).data().name
                const index = cartItem.findIndex((d)=>{
                    return d.uid === res.id
                })
                setProductCart(prevForm=>[
                    ...prevForm,
                    {
                        name: data.name,
                        type: data.type,
                        typeName: type_name,
                        detail: data.detail,
                        price: data.price,
                        uid: res.id,
                        count: cartItem[index].count
                    }
                ])
            })
        } else{
            setProductCart([])
        }
    }

    async function getDistinctCarts(carts) {
        let distinct = []
        for (const cart of carts) {
            const isFound = distinct.some(d => {
                if (cart === d.uid) {
                  return true;
                }
                return false;
            })
            if(!isFound){
                distinct.push({
                    uid: cart,
                    count: 1
                })
            } else{
                const index = distinct.findIndex((d)=>{
                    return d.uid === cart
                })
                distinct[index].count = distinct[index].count + 1
            }
        }
        return distinct
    }
    
    async function removeCart(uid) {
        carts.splice(carts.indexOf(uid), 1)
        localStorage.setItem('carts', JSON.stringify(carts))
        carts = JSON.parse(localStorage.getItem('carts'))
        await getProducts()
    }

    async function orderProduct() {
        setSuccess(false)
        const db = getFirestore()
        const orderRef = collection(db, 'orders')
        const cartItem = await getDistinctCarts(carts)
        for (const cart of cartItem) {
            const productRef = doc(db, 'products', cart.uid)
            const productData = (await getDoc(productRef)).data()
            await addDoc(orderRef, {
                name: productData.name,
                type: productData.type,
                price: productData.price,
                dateCreated: Timestamp.fromDate(new Date()),
                count: cart.count,
                byUID: user_detail.uid,
                status: "1"
            })
        }
        carts = []
        localStorage.setItem('carts', JSON.stringify(carts))
        await getProducts()
        await getOrders()
        MySwal.fire({
            icon: 'success',
            title: 'สั่งสินค้าสำเร็จ'
        })
        setSuccess(true)
    }

    async function getOrders() {
        const db = getFirestore()
        const orderRef = collection(db, 'orders')
        const orderQuery = query(orderRef, where('byUID', '==', user_detail.uid), orderBy('dateCreated', 'desc'))
        const orderData = (await getDocs(orderQuery))
        setOrders([])
        orderData.forEach(async (res)=>{
            const data = res.data()
            const type_name = (await getDoc(doc(db, 'productType', data.type))).data().name
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
                    status: data.status
                }
            ])
        })
    }
    
}