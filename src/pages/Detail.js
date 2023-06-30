import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { ReviewForm } from '../components/ReviewForm';

import { useParams } from 'react-router-dom'

import { useContext, useState, useEffect } from 'react';
import { FBDbContext } from '../context/FBDbContext';
import { FBStorageContext } from '../context/FBStorageContext';
import { AuthContext } from '../context/AuthContext';
import { FBAuthContext } from '../context/FBAuthContext';

import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

export function Detail(props) {
  const [movieData, setmoviesData] = useState()
  const [auth, setAuth] = useState()
  const [movieReviews, setMovieReviews] = useState([])
  const [ reviewed, setReviewed ] = useState( false )

  let { movieId } = useParams()

  const FBDb = useContext(FBDbContext)
  const FBStorage = useContext(FBStorageContext)
  const FBAuth = useContext(FBAuthContext)

  onAuthStateChanged(FBAuth, (user) => {
    if (user) {
      // user is signed in
      setAuth(user)
    }
    else {
      // user is not signed in
      setAuth(null)
    }
  })

  const getReviews = async () => {
    const path = `movies/${movieId}/reviews`
    const querySnapshot = await getDocs(collection(FBDb, path))
    let reviews = []
    querySnapshot.forEach((item) => {
      let review = item.data()
      review.id = item.id
      reviews.push(review)
      if( review.userid === auth.uid ) {
        setReviewed(true)
      }
    })
    setMovieReviews(reviews)
  }

  // reviews collection
  const ReviewCollection = movieReviews.map((item) => {
    return (
      <Col md="3">
        <Card>
          <Card.Body>
            <Card.Title>
              <h5>{item.title}</h5>
            </Card.Title>
            <Card.Text>
              <p>{item.content}</p>
              <p>{item.stars} stars</p>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    )
  })

  const movieRef = doc(FBDb, "movie", movieId)

  const getMovie = async () => {
    let movie = await getDoc(movieRef)
    if (movie.exists()) {
      setmoviesData(movie.data())
      getReviews()
    }
    else {
      // no book exists with the ID
    }
  }

  useEffect(() => {
    if (!movieData) {
      getMovie(movieId)
    }
  })

  // function to handle review submission
  const ReviewHandler = async (reviewData) => {
    // create a document inside firestore
    const path = `movies/${movieId}/reviews`
    const review = await addDoc(collection(FBDb, path), reviewData)
    // when the user submits a new review, refresh the reviews
    getReviews()
  }

  const Image = (props) => {
    const [imgPath, setImgPath] = useState()
    const imgRef = ref(FBStorage, `book_cover/${props.path}`)
    getDownloadURL(imgRef).then((url) => setImgPath(url))

    return (
      <img src={imgPath} className="img-fluid" />
    )
  }


  if (movieData) {
    return (
      <Container>
        <Row className="my-3">
          <Col md="4">
            <Image path={movieData.image} />
          </Col>
          <Col md="8">
            <h2>{movieData.title}</h2>
            <h4>{movieData.cast} </h4>
            <h5>{movieData.year}</h5>
            <p>{movieData.time}</p>
            <p>{movieData.tagline} </p>
          </Col>
        </Row>
        <Row className="my-3">
          <Col md="6">
            <ReviewForm user={auth} handler={ReviewHandler} reviewed={reviewed} />
          </Col>
        </Row>
        <Row>
          {/* reviews to appear here */}
          {ReviewCollection}
        </Row>
      </Container>
    )
  }
  else {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Loading...</h2>
          </Col>
        </Row>
      </Container>
    )
  }
}