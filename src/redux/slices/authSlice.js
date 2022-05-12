
import { doc, getFirestore, writeBatch } from "@firebase/firestore"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage"
const initialState = {
    accessToken:"",
    avatar:"",
    name:"",
    email:"",
    phoneNumber:"",
    age:"",
    uid:"",
    sex:"",
}

export const updateUserAvatar = createAsyncThunk('updateUserAvatar',
    async (file, store) =>{
        return await uploadImage(file, store.getState().auth.user.uid)
    }
)

export const updateUser = createAsyncThunk('updateUser',
    async (userdetail, store) =>{
        const db = getFirestore()
        const batch = writeBatch(db)
        const userRef = doc(db, "users", store.getState().auth.user.uid)
        const userinfo = userdetail
        batch.update(userRef, userinfo)
        await batch.commit()
        return userinfo
    }
)

const authSlice = createSlice({ 
    name: 'auth',
    initialState,
    reducers:{
        signIn: (state, action) =>{
            state.user = action.payload
        },
        signOutApp: (state) => {
            state.user = initialState
        }
    },
    extraReducers:{
        [updateUserAvatar.fulfilled]: (state, action)=>{
            state.user = Object.assign(state.user , action.payload)
        },
        [updateUser.fulfilled]: (state, action)=>{
            state.user = Object.assign(state.user , action.payload)
        }
    }
})

function uploadImage(file, uid){
    return new Promise((resolve)=>{
        const db = getFirestore()
        const storage = getStorage()
        const storageRef = ref(storage, `usersAvatar/${uid}`)
        uploadString(storageRef, file, 'data_url').then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                const batch = writeBatch(db)
                const userRef = doc(db, "users", uid)
                const avatar = {avatar: downloadURL}
                batch.update(userRef, avatar)
                batch.commit()
                resolve(avatar)
            })
        })   
    })
}

export const {signIn , signOutApp} = authSlice.actions

export const getUser = (state) => {
    let user = {}
    for (const key in state.auth.user) {
        if(state.auth.user[key] === null) {
            Object.assign(user, {[`${key}`]: ""})
        } else {
            Object.assign(user, {[`${key}`]: state.auth.user[key]})
        }
    }
    return user
}

export default authSlice.reducer