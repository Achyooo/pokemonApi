// PokeDetail.js



import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Header from './Header';
import pokeballDotImg from './img/pokeball_dot.webp';

import "./css/pokedex.css";



const PokeDetail = () => {

    // useState. 포켓몬 데이터 배열
    const [ pokemonData, setPokemonData ] = useState(null); // 포켓몬 데이터(배열)
    const [ loading, setLoading ] = useState(false); // 로딩 상태 추가

    const [ isShiny, setIsShiny ] = useState(false);
    const [ isDreamAbility, setIsDreamAbility ] = useState(false);



    // 파라미터 찾기
    const [searchParams] = useSearchParams();
    const gen = searchParams.get('gen');
    const pokemonId = searchParams.get('id');
    // console.log(pokemonId);


    // 네비게이션 선언
    const navigate = useNavigate();



    // axios.
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true) // 로딩 시작!
            try{
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
                const korean = speciesResponse.data.names.find((name) => name.language.name === 'ko');
                const types = await Promise.all(response.data.types.map(async (type) => {
                    const typeResponse = await axios.get(type.type.url);
                    const koreanType = typeResponse.data.names.find((name)=>name.language.name === "ko");
                    return {
                        ...type,
                        korean_name: koreanType ? koreanType.name : type.type.name
                    }
                }))
                const abilities = await Promise.all(response.data.abilities.map(async (ability) => {
                    const abilityResponse = await axios.get(ability.ability.url);
                    const koreanAbility = abilityResponse.data.names.find((name) => name.language.name === 'ko');
                    return {
                      ...ability,
                      korean_name: koreanAbility ? koreanAbility.name : ability.ability.name
                    };
                }))
                setPokemonData({ ...response.data,
                                 korean_name: korean ? korean.name : response.data.name,
                                 types,
                                 abilities
                              });
            }catch(error){
                console.error("Error Error Error Error Errorrrrr!!!", error)
            }finally{
                setLoading(false) // 로딩 끝
            }
        };
        fetchData();
    }, [pokemonId]);




    // 데이터가 아직 로드되지 않았다면. 초기 null값 때문에 오류뜨니까 방지 코드
    // pokemonData가 null이 아닐 때만 속성에 접근하도록 보장
    if (!pokemonData) {
        return (
            <>
                <Header />
                <div className='loading'>
                    <img src={pokeballDotImg}></img>
                    <p>Loading...</p>
                    <img src={pokeballDotImg}></img>
                </div>
            </>
        );
    }



    const onClickShiny = () => {
        setIsShiny((prev)=>(!prev))
    }


    const onClickBack = () => {
        navigate(`/?gen=${gen}`);
    }



    return (
        <>
            <Header/>


            <div className='pokedexContainer'>
                {loading ? 
                    (<div className='loading'>
                        <img src={pokeballDotImg}></img>
                        <p>Loading...</p>
                        <img src={pokeballDotImg}></img>
                    </div>)
                    :
                    (<div className='pokedexBody'>
                        <h1>{pokemonData.korean_name}</h1>
                        
                        <button className="shiny-btn"
                                onClick={onClickShiny}>
                            { isShiny ? "기본 모습 보기" : "색이 다른 모습 보기"}
                        </button>

                        <img className='official-art'
                             src={isShiny ? pokemonData.sprites.other["official-artwork"].front_shiny : pokemonData.sprites.other["official-artwork"].front_default}
                             alt={pokemonData.korean_name} />
                        <img className='pokemon-dot'
                             src={isShiny ? pokemonData.sprites.front_shiny : pokemonData.sprites.front_default}
                             alt={pokemonData.korean_name} />
                        
                        <div>타입: {pokemonData.types.map((t, idx)=>(
                            <span key={idx}>{t.korean_name}{idx < pokemonData.types.length-1 ? ', ' : ''}</span>))}
                        </div>

                        <div>특성: {pokemonData.abilities
                                               .filter((a) => !a.is_hidden)
                                               .map((a, idx)=>(
                                                <span key={idx}>
                                                    {a.korean_name}
                                                    {idx < pokemonData.abilities.filter((a) => !a.is_hidden).length-1 ? ', ' : ''}
                                                </span>
                                                ))
                                    }
                        </div>

                        {/* 숨특은 무조건 하나 */}
                        <div>숨겨진 특성: {pokemonData.abilities
                                               .filter((a) => a.is_hidden)
                                               .map((a, idx)=>(
                                                <span key={idx}>
                                                    {a.korean_name}
                                                </span>
                                                ))
                                         }
                        </div>

                        <button onClick={onClickBack}>뒤로가기</button>

                    </div>)
                }
            </div>
        
        </>
    );
};

export default PokeDetail;