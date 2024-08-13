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

    // ※ 지금 문제 ※
    // searchTerm/searchInput이 검색된 상태에서
    // Pokedex 페이지에서 헤더 로고를 누르면
    // 오류 없이 gen1이 소환됨
    // 다만 PokeDetail 페이지에서 헤더 로고를 누르면
    // setSearchTerm, setSearchInput은 함수가 아니라는 오류 생김 (근데 이동은 됨;)
    // 후에 보강 필요


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