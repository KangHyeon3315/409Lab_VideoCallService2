import "./Header.css"
import { MdOutlineLogout } from 'react-icons/md'
import { useNavigate } from "react-router-dom";

function Header(props) {
    const navigate = useNavigate();

    return (
        <div id="header">
            <b id="logo">
                409 Labs
            </b>
            <MdOutlineLogout
            id="logoutBtn"
            onClick={() => {
                sessionStorage.setItem("token", null);
                navigate('/signin')
            }}
        />
        </div>
    )
}

export default Header;