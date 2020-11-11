import React, { useState, useEffect, useCallback, useRef } from "react";
import { render } from "react-dom";
import axios from "axios";
const App = () => {
const [posts, setPosts] = useState([])
const [element, setElement] = useState(null);
const [loading, setLoading] = useState(false);

const itemLimit = useRef(6);
const page = useRef(1);
const prevY = useRef(0);

const observer = useRef(
    new IntersectionObserver(
        entries => {
            const y = entries[0].boundingClientRect.y;
            if (prevY.current > y) {
                loadMore()
            }
            prevY.current = y;
        }, {threshold: 1}
    )
)
    const fetchData = useCallback(async (page,limit) => {
        const apiUrl = `http://localhost:3000/posts?_page=${page}&_limit=${limit}`;
        console.log(apiUrl);
        setLoading(true);
        try{
            const response = await axios.get(apiUrl);
            const {status, data} = response;
            setLoading(false);
            return {status, data};
        } catch (error){
            setLoading(false);
            return error;
        }
    }, [])
    const getPosts = useCallback(
        async (page,limit) => {
            const newPosts = await fetchData(page,limit);
            const {status, data} = newPosts;
            console.log(data);
            if (status === 200) setPosts(posts => [...posts, ...data])

        }, [fetchData]
    )
    const loadMore = () => {
    page.current += 1;
    getPosts(page.current,itemLimit.current)
    }
    useEffect(() => {
        getPosts(page.current,itemLimit.current);
    },[getPosts]);

    useEffect(() => {
        const currentElement = element;
        const currentObserver = observer.current;
        if (currentElement) currentObserver.observe(currentElement);
        return () => {
            if (currentElement) currentObserver.unobserve(currentElement);
        };
    }, [element]);

    return (
        <div className="wrapper">
            <div className="feed">
                <div className="feed__header">
                    <h2>Najnowsze</h2>
                </div>

                    {posts && (
                        <div className="feed__section">
                            {
                                posts.map((post, index) => (
                                    <div key={index} className="news">
                                        <a href={post.url}>
                                            <div className="news__image">
                                                <img className="thumbnail" src={post.thumb} alt={post.title}/>
                                            </div>
                                        </a>
                                        <div className="news__content">
                                            <time>{post.date}</time>
                                            <a href={post.url}>
                                                <h3>{post.title}</h3>
                                                <p>{post.excerpt}</p>
                                            </a>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                {loading && <div className="feed__loading">Wczytywanie ...</div>}
                { !loading &&
                    <div className="feed__more" ref={setElement}>
                    <a> </a>
                    </div>
                }

            </div>
        </div>
    )

}

render(<App />, document.getElementById("root"))