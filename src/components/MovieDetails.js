import { useState, useRef, useEffect } from "react";
import { useKey } from "./useKey";
import Loader from "./Loader";
import StarRating from "./StarRating";

const KEY = process.env.REACT_APP_API_KEY;
const baseURL = process.env.REACT_APP_BASE_API_URL;
const posterURL = process.env.REACT_APP_POSTER_URL;

export default function MovieDetails({
  selectedID,
  onCloseMovie,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRatingClicks = useRef(0);

  useEffect(() => {
    if (userRating) countRatingClicks.current += 1;
  }, [userRating]);

  const isWatched = watched.some((movie) => movie.imdbID === selectedID);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedID
  )?.userRating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title: movie.Title,
      poster: movie.Poster,
      year: movie.Year,
      imdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRatingClicks.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  useEffect(() => {
    setIsLoading(true);
    async function getMovieDetails() {
      const res = await fetch(
        `${baseURL}/movie/${selectedID}?api_key=${KEY}&append_to_response=credits`
      );

      const data = await res.json();
      const { credits } = data;

      setMovie({
        Title: data.title,
        Year: data.release_date ? data.release_date.split("-")[0] : "NA",
        Poster: data.poster_path
          ? `${posterURL}${data.poster_path}`
          : `${posterURL}${data.backdrop_path}`,
        Runtime: data.runtime ? `${data.runtime} min` : "N/A",
        imdbRating: data.vote_average,
        Plot: data.overview,
        Released: data.release_date ? data.release_date.split("-")[0] : "NA",
        Genre: data.genres
          ? data.genres.map((genre) => genre.name).join(", ")
          : "N/A",
        Director:
          credits?.crew?.find((member) => member.job === "Director")?.name ||
          "N/A",
        Cast: credits?.cast
          ? credits.cast
              .slice(0, 5)
              .map((member) => member.name)
              .join(", ")
          : "NA",
      });
      setIsLoading(false);
    }

    getMovieDetails();
  }, [selectedID, movie.backdrop_path]);

  useEffect(() => {
    if (!movie.Title) return;
    document.title = `Movie | ${movie.Title}`;

    return () => {
      document.title = "Rate-Movies";
    };
  }, [movie.Title]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
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
            <img src={movie.Poster} alt={`Poster of ${movie.Title} movie`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐</span>
                {movie.imdbRating?.toFixed(2)} IMDb rating
              </p>
              <p>
                <strong>Director:</strong> {movie.Director}
              </p>
              <p>
                <strong>Cast:</strong> {movie.Cast}
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You already rated this movie {watchedUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
          </section>
        </>
      )}
    </div>
  );
}
