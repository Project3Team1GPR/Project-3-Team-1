import { useState, useEffect } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
// import { saveBook, searchGoogleBooks } from '../utils/API';
import { saveCocktailIds, getSavedCocktailIds } from '../utils/localStorage';
import { useMutation } from '@apollo/client';
import { SAVE_COCKTAIL } from '../utils/mutations';
import SearchForm from '../components/SearchForm';

const SearchCocktails = () => {
  // create state for holding returned google api data
  const [searchedCocktails, setSearchedCocktails] = useState([]);
  // // create state for holding our search field data
  // const [searchInput, setSearchInput] = useState('');

  // create state to hold saved bookId values
  const [savedCocktailIds, setSavedCocktailIds] = useState(getSavedCocktailIds());

  const [saveCocktail, { error }] = useMutation(SAVE_COCKTAIL);

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveCocktailIds(savedCocktailIds);
  });

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event, searchInput) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    // change line below
    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const cocktailData = items.map((cocktail) => ({
        name: cocktail.name,
        category: cocktail.category,
        ingredients: cocktail.ingredients,
        instructions: cocktail.instructions,
        image: cocktail.imageLinks?.thumbnail || '',
      }));

      setSearchedCocktails(cocktailData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveCocktail = async (_id) => {
    // find the book in `searchedBooks` state by the matching id
    const cocktailToSave = searchedCocktails.find((cocktail) => cocktail._id === _id);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await saveCocktail({
        variables: { cocktailInput: {...cocktailToSave} },
      });

      if (!data.saveCocktail) {
        throw new Error('something went wrong!');
      }

      // if cocktail successfully saves to user's account, save book id to state
      setSavedCocktailIds([...savedCocktailIds, cocktailToSave._id]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Cocktails!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a cocktail'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div> */}

      <SearchForm handleFormSubmit={handleFormSubmit} />

      <Container>
        <h2 className='pt-5'>
          {searchedCocktails.length
            ? `Viewing ${searchedCocktails.length} results:`
            : 'Search for a cocktail to begin'}
        </h2>
        <Row>
          {searchedCocktails.map((cocktail) => {
            return (
              <Col md="4" key={cocktail._id}>
                <Card border='dark'>
                  {cocktail.image ? (
                    <Card.Img src={cocktail.image} alt={`The cover for ${cocktail.name}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{cocktail.title}</Card.Title>
                    <p className='small'>Category: {cocktail.category}</p>
                    <Card.Text>{cocktail.ingredients}</Card.Text>
                    <Card.Text>{cocktail.instructions}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedCocktailIds?.some((savedId) => savedId === cocktail._id)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveCocktail(cocktail._id)}>
                        {savedCocktailIds?.some((savedCocktailId) => savedCocktailId === cocktail._id)
                          ? 'This cocktail has already been saved!'
                          : 'Save this Cocktail!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchCocktails;