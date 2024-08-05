// Header.js



import React from 'react';

import { Link } from 'react-router-dom';


import pokeballImg from './img/pokeball.webp';

import "./css/header.css";



const Header = ({setSearchTerm, setSearchInput}) => {


    const resetSearch = () => {
        setSearchTerm('');
        setSearchInput('');
    }


    return (
        <div className='headerContainer'>
            <Link to="/?gen=1"
                  className='logoPlace'
                  onClick={resetSearch}>
                <img src={pokeballImg}></img>
                <span>포켓몬 도감</span>
            </Link>
        </div>
    );
};

export default Header;