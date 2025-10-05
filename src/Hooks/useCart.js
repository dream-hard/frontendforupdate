import {CartContext} from '../contexts/Cartcontaxt';
import { useContext } from 'react'

const useCart=()=>{
    return useContext(CartContext);
}

export default useCart;