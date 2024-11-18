import React, { useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import "./../index.css";

const KEY = process.env.REACT_APP_API_KEY;
const posterURL = process.env.REACT_APP_POSTER_URL;
const language = process.env.REACT_APP_LANGUAGE;
const baseURL = process.env.REACT_APP_BASE_API_URL;

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState({});

  const slideshowInterval = useRef(null);
  console.log({ KEY, posterURL, language, baseURL });

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          `${baseURL}/genre/movie/list?api_key=${KEY}&language=${language}`
        );
        const data = await res.json();
        const genreMap = data.genres.reduce((acc, genre) => {
          acc[genre.id] = genre.name;
          return acc;
        }, {});
        setGenres(genreMap);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    }

    fetchGenres();
  }, []);

  useEffect(() => {
    async function fetchTrendingMovies() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${baseURL}/trending/movie/week?api_key=${KEY}`
        );
        const data = await res.json();
        if (data.results) {
          const selectedMovies = data.results;
          setMovies(selectedMovies.sort(() => 0.5 - Math.random()));
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrendingMovies();
  }, []);

  useEffect(() => {
    if (!isLoading && movies.length > 0) {
      slideshowInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      }, 7000);
      return () => clearInterval(slideshowInterval.current);
    }
  }, [movies, isLoading]);

  const resetSlideshowTimer = () => {
    clearInterval(slideshowInterval.current);
    slideshowInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 7000);
  };

  return (
    <div className="slideshow-container">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className={`slide ${index === currentIndex ? "active" : ""}`}
            >
              <div className="movie-info">
                <h2>{movie.title}</h2>
                <p>{movie.overview}</p>
                <p>
                  Genre:{" "}
                  {movie.genre_ids
                    .map((id) => genres[id] || "Unknown")
                    .join(", ")}
                </p>
                <p>Release Date: {movie.release_date}</p>
              </div>
              <img
                src={`${posterURL}${movie.poster_path}`}
                alt={`Poster of ${movie.title}`}
              />
            </div>
          ))}
          <button
            className="arrow arrow-right"
            onClick={() => {
              setCurrentIndex(
                (currentIndex - 1 + movies.length) % movies.length
              );
              resetSlideshowTimer();
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="arrow arrow-left"
            onClick={() => {
              setCurrentIndex((currentIndex + 1) % movies.length);
              resetSlideshowTimer();
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
