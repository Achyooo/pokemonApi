// Header.js



import React from 'react';

import { Link } from 'react-router-dom';


import pokeballImg from './img/pokeball.webp';

import "./css/pokedex.css";


// 커밋 테스트

const Header = () => {

    return (
        <div className='headerContainer'>
            <Link to="/?gen=1" className='logoPlace'>
                <img src={pokeballImg}></img>
                <span>포켓몬 도감</span>
            </Link>
        </div>
    );
};

export default Header;