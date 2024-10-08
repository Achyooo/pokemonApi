// Pokedex.js


import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Link } from 'react-router-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Header from './Header';
import pokeballDotImg from './img/pokeball_dot.webp';


import "./css/pokedex.css";



const Pokedex = () => {

    // 이건 걍 특정 도감번호만 가져오려고 만들었던 배열...걍 보류해둠
    // const pokemonIds = [677, 678, 684, 685, 696, 697, 700, 702];


    // useState. 포켓몬 데이터 배열
    const [ pokemonData, setPokemonData ] = useState([]); // 포켓몬 데이터(배열)
    const [ loading, setLoading ] = useState(false); // 로딩 상태 추가

    // 검색창 상태
    const [ searchTerm, setSearchTerm ] = useState(''); // 검색어 상태
    const [ searchInput, setSearchInput ] = useState(''); // 입력 필드 상태

    // 넓이 제한 주기. 반응형 state.
    const [ windowWidth, setWindowWidth ] = useState(window.innerWidth)

    useEffect(()=>{
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[]);

    // 네비게이션 쓸거당
    const navigate = useNavigate();

    // 파라미터 쓸거당
    const [searchParams, setSearchParams] = useSearchParams();

    const queryGen = parseInt(searchParams.get("gen")) || 1;
    const [ currentGen, setCurrentGen ] = useState(queryGen); // 선택된 세대 useState



    // 세대 별 도감번호 시작-끝
    const generations = {
        1: [1, 151],
        2: [152, 251],
        3: [252, 386],
        4: [387, 493],
        5: [494, 649],
        6: [650, 721],
        7: [722, 809],
        8: [810, 905],
        9: [906, 1024],
        // 10: [10001, 10277]
    };



    // axios.
    const fetchPokemonData = async (start, end) => {

        setLoading(true) // 로딩 시작!
        const allPokemonData = []; // 데이터 집어넣을 빈 배열 선언

        const requests = []; // 요청을 병렬로 처리하기 위한 빈 배열

        for (let i=start; i<=end; i++){

            // 제외할 번호들... (주인포켓몬 3d 스프라이트, 중복 도트, 이미지 없는 데이터 등등)
            const excludedIds = [
                ...Array.from({ length: 6 }, (_, index) => 10027 + index),
                ...Array.from({ length: 7 }, (_, index) => 10093 + index),
                10117,
                ...Array.from({ length: 2 }, (_, index) => 10121 + index),
                ...Array.from({ length: 8 }, (_, index) => 10128 + index),
                ...Array.from({ length: 3 }, (_, index) => 10144 + index),
                ...Array.from({ length: 4 }, (_, index) => 10148 + index),
                ...Array.from({ length: 2 }, (_, index) => 10153 + index),
                ...Array.from({ length: 3 }, (_, index) => 10158 + index),
                ...Array.from({ length: 3 }, (_, index) => 10181 + index),
                10187,
                10192,
                ...Array.from({ length: 8 }, (_, index) => 10264 + index)
            ];


            if (!excludedIds.includes(i)) {
                requests.push(
                    axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)
                        .then(response => {
                            const english = response.data.species.name;
                            const upperEng = english.charAt(0).toUpperCase() + english.slice(1);
                            // const english = response.data.forms[0].name; // 부가설명까지 추가된 이름 (ex:audino-mega)

                            if (i >= 10001) {
                                return {
                                    ...response.data,
                                    korean_name: upperEng // 한국어 이름이 없을 경우 기본값 설정
                                };
                            } else {
                                return axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`)
                                    .then(speciesResponse => {
                                        const korean = speciesResponse.data.names.find((n) => n.language.name === "ko");
                                        return {
                                            ...response.data,
                                            korean_name: korean ? korean.name : upperEng // 한국어 이름이 없을 경우 기본값 설정
                                        };
                                    })
                                    .catch(() => {
                                        // console.warn(`ID: ${i} = 종 데이터 없음`);
                                        return {
                                            ...response.data,
                                            korean_name: upperEng // 종 데이터가 없을 경우 기본값 설정
                                        };
                                    });
                            }
                        })
                        .catch(() => {
                            // console.error(`ID: ${i} = 데이터 못가져옴`)
                            return null; // 데이터를 못 가져온 경우 null 반환
                        })
                );
            }
        }


        try{
            // 위에 모든 요청들을 병렬로 실행해서 데이터 내 놔
            const allPokemonData = await Promise.all(requests);
            // 그리고 그 데이터 상태에 저장하는데, 데이터값이 null값이 아닌것만
            setPokemonData(allPokemonData.filter((data) => data !== null));
            
        }catch(error){
            console.error(`Error Error Error Error Error`, error) // 에러났으면 콘솔에 띄우십쇼
        
        }finally{
            setLoading(false) // 다했으면 로딩 끝
        }

    };


    // 쿼리 파라미터가 변경될때마다 currentGen 상태 업뎃하고 데이터 가져오기.
    useEffect(()=>{
        setCurrentGen(queryGen);
    },[queryGen])


    
    // currentGen(세대) 상태가 변경될때마다 데이터 가져오기.
    // 인데, 만약 검색어가 있다면 모든 세대의 포켓몬 데이터 가져오기.
    useEffect(()=>{
        if(currentGen !== null){
            if(searchTerm === '') {
                // 세대 상태가 변경되면 세대에 따른 데이터 가져오기
                const [start, end] = generations[currentGen];
                fetchPokemonData(start, end);
            } else {
                // 검색어가 있다면, 모든 세대의 포켓몬 데이터 가져오기
                const allGenPokemon = [1, 1024];
                fetchPokemonData(allGenPokemon[0], allGenPokemon[1]);
            }
        }
    },[currentGen, searchTerm]);



    // 세대 버튼 클릭 핸들러
    const handleGenClick = (gen) => {
        console.log(gen);
        setCurrentGen(gen);
        setSearchParams({gen});
        setSearchTerm('');
        setSearchInput('');
    };



    // 디테일 페이지로
    const onClickDetail = (id) => {
        // console.log(id);
        navigate(`poke-detail?gen=${currentGen}&id=${id}`);
    }



    // 검색창 온체인지
    const onChangeTerm = (e) => {
        // console.log(e.target.value);
        setSearchInput(e.target.value);
    };


    // 검색창 필터링 포켓몬
    const filteredPokemonName = pokemonData.filter((pokemon)=>
        pokemon.korean_name.includes(searchTerm)
    );

    // console.log(filteredPokemonName, "검색결과 없음");


    // 검색어 제출
    const onSubmitTerm = (e) => {
        e.preventDefault();
        setSearchTerm(searchInput); // 검색어상태를 인풋창상태로 업데이트
    };



    return (
        <>

        {/* 헤더 */}
        <Header setSearchTerm={setSearchTerm}
                setSearchInput={setSearchInput}/>


        {/* 검색창 */}
        <div className='searchBoxAndBtn'>
            <form onSubmit={onSubmitTerm}>
                <input type="text"
                       value={searchInput} // 입력 필드 상태
                       onChange={onChangeTerm}
                       placeholder='포켓몬 이름'>
                </input>
                <button type='submit'>검색</button>
            </form>
        </div>
        



        {/* 세대 버튼 */}
        <div className={`genBtn
                         ${windowWidth<1100 ? 'narrowScreen' : ''}
                         ${windowWidth<900 ? 'narrowerScreen' : ''}
                        `}>
            {Object.keys(generations).map((gen)=>(
                <div className='oneBtn' key={gen}>
                    <p onClick={()=>handleGenClick(parseInt(gen))}>
                        {/* {parseInt(gen) === 10 ? "그 외" : `${gen}세대`} */}
                        {gen}세대
                    </p>
                </div>
            ))}
        </div>



        {/* 도감 데이터 */}
        <div className='pokedexContainer'>

            {loading ? 
                (<div className='loading'>
                    <img src={pokeballDotImg}></img>
                    <p>Loading...</p>
                    <img src={pokeballDotImg}></img>
                </div>)
                :
                (filteredPokemonName.length === 0 ?
                    (<div className='no-pokemon-data'>
                        <p>검색 결과가 없습니다.</p>
                    </div>)
                    :
                    (filteredPokemonName.map((item)=>(
                        <div className="pokemon" 
                             key={item.id}
                             onClick={()=>onClickDetail(item.id)}>
                        
                            <img src={item.sprites.front_default}
                                 alt={item.korean_name}/>

                            <p>No.{item.id}</p>
                            <p>{item.korean_name}</p>

                        </div>))
                    )
                )
            }

        </div>


        </>

    );
};

export default Pokedex;