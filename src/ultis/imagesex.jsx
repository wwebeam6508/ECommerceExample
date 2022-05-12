import female_avatar from '../assets/images/female_avatar.png'
import male_avatar from '../assets/images/male_avatar.png'
import avatar from '../assets/images/avatar.png'
export function imagesex(sex) {
    if(sex === "male"){
        return male_avatar
    }else if(sex === "female"){
        return female_avatar
    }else{
        return avatar
    }
}