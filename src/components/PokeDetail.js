// PokeDetail.js



import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Header from './Header';
import pokeballDotImg from './img/pokeball_dot.webp';

import "./css/pokeDetail.css";



const PokeDetail = () => {

    // useState. 포켓몬 데이터 배열
    const [ pokemonData, setPokemonData ] = useState(null); // 포켓몬 데이터(배열)
    const [ loading, setLoading ] = useState(false); // 로딩 상태 추가

    const [ isShiny, setIsShiny ] = useState(false);

    // 넓이 제한 주기. 반응형 state.
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(()=>{
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[]);



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
                    };
                }))
                const abilities = await Promise.all(response.data.abilities.map(async (ability) => {
                    const abilityResponse = await axios.get(ability.ability.url);
                    const koreanAbility = abilityResponse.data.names.find((name) => name.language.name === 'ko');
                    return {
                      ...ability,
                      korean_name: koreanAbility ? koreanAbility.name : ability.ability.name
                    };
                }))
                const moves = await Promise.all(response.data.moves.map(async (move) => {
                    const moveResponse = await axios.get(move.move.url);
                    const koreanMove = moveResponse.data.names.find((name)=>name.language.name === "ko");
                    const powerMove = moveResponse.data.power;
                    // 여기서부터테스트(오 됐다)
                    const moveTypeResponse = await axios.get(moveResponse.data.type.url);
                    const koreanMoveType = moveTypeResponse.data.names.find((name) => name.language.name === "ko");
                    return {
                        ...move,
                        korean_name: koreanMove ? koreanMove.name : move.move.name,
                        power: powerMove ? powerMove : "-",
                        // 이거도테스트
                        korean_move_type: koreanMoveType ? koreanMoveType.name : "?"
                    };
                }))
                setPokemonData({ ...response.data,
                                 korean_name: korean ? korean.name : response.data.name,
                                 types,
                                 abilities,
                                 moves
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
        setIsShiny((prev)=>(!prev));
    }


    const onClickBack = () => {
        navigate(`/?gen=${gen}`);
    }

    
    const hiddenAbility = pokemonData.abilities.find(a => a.is_hidden);
    // console.log(hiddenAbility);



    return (
        <>
            <Header/>


            <div className='pokeDetailContainer'>
                {loading ? 
                    (<div className='loading'>
                        <img src={pokeballDotImg}></img>
                        <p>Loading...</p>
                        <img src={pokeballDotImg}></img>
                    </div>)
                    :
                    (<div className={`pokeDetailBody
                                      ${windowWidth<800 ? 'narrowScreen' : ''}
                                      ${windowWidth<560 ? 'narrowerScreen' : ''}
                                    `}>
                        <p className='pokemon-num'>No.{pokemonData.id}</p>
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

                        
                        {/* 포켓몬 정보 (타입, 특성, 숨특) */}
                        <div className='info'>

                            <div className='oneLine'>
                                <span className='sub-title'>타입</span>
                                {pokemonData.types.map(t => t.korean_name).join(' / ')}
                            </div>

                            <div className='oneLine'>
                                <span className='sub-title'>특성</span>
                                    {pokemonData.abilities
                                                .filter((a) => !a.is_hidden)
                                                .map((a) => a.korean_name)
                                                .join(' / ')
                                    }
                            </div>

                            {/* 숨특은 무조건 하나이기 때문에 */}
                            <div className='oneLine'>
                                <span className='sub-title'>숨겨진 특성</span>
                                    {hiddenAbility ? 
                                        <span>{hiddenAbility.korean_name}</span>
                                        :
                                        <span>X</span>
                                    }          
                            </div>

                        </div>


                        {/* 기술 */}
                        <div className='movesDiv'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>기술명</th>
                                        <th>타입</th>
                                        <th>위력</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pokemonData.moves.map((m, idx) => <tr key={idx}>
                                        <td>{m.korean_name}</td>
                                        <td>{m.korean_move_type}</td>
                                        <td>{m.power}</td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>


                        <div className='backBtnContainer'>
                            <button className='backBtn'
                                    onClick={onClickBack}>목록으로</button>
                        </div>
                       
                    </div>)
                }
            </div>
        
        </>
    );
};

export default PokeDetail;