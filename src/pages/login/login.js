import React, { useState} from "react"
import './login.scss'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { getAuth, signInWithEmailAndPassword, signOut} from 'firebase/auth'
import { useHistory } from "react-router-dom"
import { useDispatch } from "react-redux"
import { signIn } from "../../redux/slices/authSlice"
import isEmpty from '../../../src/ultis/isEmpty'
export default function Login() {
    const MySwal = withReactContent(Swal)
    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const history = useHistory()
    const dispatch = useDispatch()

    return(
        <div className="container login_zone">
            <div className="brand-logo"></div>
            <div className="brand-title">ECommerce</div>
            <div className="inputs">
                <label> Email</label>
                <input value={email} onChange={(e)=>{setEmail(e.target.value)}} type="email" placeholder="example@example" />
                <label> Password</label>
                <input value={password} onChange={(e)=>{setPassword(e.target.value)}} type="password" placeholder="password" />
                <button type="button" onClick={()=>{checkempty()}}>ลงชื่อเข้าใช้</button>
                <button type="button" style={{backgroundColor: 'blue'}} onClick={()=>{
                    history.push('register')
                }}>สมัคร</button>
            </div>
        </div>
    )

    function checkempty(){
        if(isEmpty(email) || isEmpty(password)){
            MySwal.fire({
                icon: 'warning',
                title: `โปรดกรอกรหัสให้ถูกต้อง`
            })
        } else {
            login()
        }
    }

    function login() {
        const auth = getAuth()
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user
            dispatch(signIn
                ({
                    accessToken:user.accessToken,
                    displayName:user.displayName,
                    email:user.email,
                    uid:user.uid
                })
            )
            history.push("/")
        })
        .catch((error) => {
            const auth = getAuth()
            signOut(auth)
            history.push("/login")
            MySwal.fire({
                icon: 'error',
                title: `${error.code}`,
                text: `${error.message}`
            })
        })
    }
}