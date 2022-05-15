
import './App.scss'
import React, { useState } from "react"

import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import Home from './pages/home/home'
import Login from './pages/login/login'
import Register from './pages/register/register'
import 'bootstrap/dist/css/bootstrap.min.css'
import { firebaseConfig } from './firebase/firebaseConfig'
import * as firebase from 'firebase/app'
import { signIn } from './redux/slices/authSlice'
import { getAuth, onAuthStateChanged} from "@firebase/auth"
import { getFirestore, getDoc, doc } from "firebase/firestore"
import { useDispatch } from "react-redux"
import moment from 'moment'
import Setting from './pages/setting/setting'
import { Container } from 'react-bootstrap'
import Admin from './pages/admin/admin'
import HR from './pages/admin/menu/hr'
import ProductType from './pages/admin/menu/productType'
import Products from './pages/admin/menu/products'
import ProductView from './pages/productView/productView'
import Cart from './pages/cartView/cart'
import Customer from './pages/admin/menu/customer'
import Orders from './pages/admin/menu/orders'

firebase.initializeApp(firebaseConfig)
function App() {
  
  const auth = getAuth()
  const dispatch = useDispatch()
  const db = getFirestore()
  const [isLoggedIn, setisLoggedIn] = useState(false)
  const [userType, setUserType] = useState("")
  const [success, setSuccess] = useState(false)

  onAuthStateChanged(auth ,async (user) =>{
    
    if (user) {
      const usersRef = doc(db, "users", user.uid)
      const user_doc = await getDoc(usersRef)
      const user_data = user_doc.data()
      let user_detail = user_data
      setUserType(user_detail.userType)
      user_detail = Object.assign(user_detail, {
          accessToken:user.accessToken,
          uid:user.uid,
        })
      user_detail.dateCreated = moment( new Date(user_detail.dateCreated.seconds*1000)).format('DD/MM/YYYY hh:mm:ss')
      dispatch(signIn
        (user_detail)
      )
      setisLoggedIn(true)
    } else {
      setisLoggedIn(false)
    }
    setTimeout(() => {
      setSuccess(true)
    }, 1000)
  })
  return (
    !success ? 
      <Container className='center-screen'>
         Loading
      </Container>
    :
      <Router>
        <Switch>
          <Route path="/home" 
            render={()=>( isLoggedIn ? userType === 'user' ? <Home/> : <Redirect to="/admin" />  : <Redirect to="/login" /> )} />
          <Route path="/productView" 
              render={()=>( isLoggedIn ? userType === 'user' ? <ProductView/> : <Redirect to="/admin" />  : <Redirect to="/login" /> )} />
          <Route path="/cart" 
              render={()=>( isLoggedIn ? userType === 'user' ? <Cart/> : <Redirect to="/admin" />  : <Redirect to="/login" /> )} />
          <Route path="/setting" 
            render={()=>( isLoggedIn ?  <Setting/> : <Redirect to="/login" /> )} />
          <Route path="/login" 
            render={()=>( isLoggedIn ? <Redirect to="/home" />  : <Login/> )} />
          <Route path="/register" 
            render={()=>( isLoggedIn ? <Redirect to="/home" />  : <Register/> )} />
          <Route path="/admin" 
            render={()=>( isLoggedIn ? userType === 'admin' ? <Admin/> : <Redirect to="/" />  : <Redirect to="/login" /> )} />
          <Route path="/hr" 
            render={()=>( isLoggedIn ? userType === 'admin' ? <HR/> : <Redirect to="/" />  : <Redirect to="/login" /> )} />
          <Route path="/customer" 
            render={()=>( isLoggedIn ? userType === 'admin' ? <Customer/> : <Redirect to="/" />  : <Redirect to="/login" /> )} />
          <Route path="/order" 
              render={()=>( isLoggedIn ? userType === 'admin' ? <Orders/> : <Redirect to="/" />  : <Redirect to="/login" /> )} />
          <Route path="/productType" 
            render={()=>( isLoggedIn ? userType === 'admin' ? <ProductType/> : <Redirect to="/" />  : <Redirect to="/login" /> )} />
          <Route path="/products" 
              render={()=>( isLoggedIn ? userType === 'admin' ? <Products/> : <Redirect to="/" />  : <Redirect to="/login" /> )} />
          <Route path="/" 
            render={()=>( <Redirect to="/home" /> )} />
        </Switch>
      </Router>
  )
}

export default App
