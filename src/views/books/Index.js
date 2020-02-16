import React, { Component } from "react";
import axios from "axios";
import propTypes from "prop-types";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";

import {
  Card,
  ListGroup,
  ListGroupItem,
  CardColumns,
  Button,
  Col,
  Row,
  InputGroup,
  FormControl
} from "react-bootstrap";
import defaultCover from "../../placeholder.png";

//Functional Reac Component
const Book = props => (
  <Card>
    <Card.Img variant="top" src={defaultCover} />
    <Card.Body>
      <Card.Title>{props.book.title}</Card.Title>
      <Card.Text>{props.book.description}</Card.Text>
    </Card.Body>
    <Card.Body>
      <Card.Link href={`books/${props.book._id}`}>Show Book</Card.Link>
    </Card.Body>
    <Card.Footer>
      <small className="text-muted">{props.book.lastUpdated}</small>
    </Card.Footer>
  </Card>
);

export default class BookIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {
      books: [],
      search: ""
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:4000/books/")
      .then(response => {
        console.log(response);
        this.setState({
          books: response.data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
  handleInputChange = e => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    console.log(`Input name ${name}. Input value ${value}.`);

    this.setState({
      [name]: value
    });
  };

  bookList() {}

  render() {
    let filteredBooks = this.state.books.filter(book => {
      return book.title.indexOf(this.state.search) !== -1;
    });
    return (
      <>
        <Row>
          <Col sm={12}>
            <h3>Book List</h3>
            <hr />
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            {localStorage.jwtToken != null ? (
              <Button as={Link} to="/books/create">
                Add Book
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login">
                  Login to Create
                </Button>
              </>
            )}
          </Col>
          <Col sm={4}>
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">Search</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                placeholder="Search"
                name="search"
                aria-label="Search"
                aria-describedby="basic-addon1"
                value={this.state.search}
                onChange={this.handleInputChange}
              />
            </InputGroup>
          </Col>
        </Row>

        <CardColumns>
          {filteredBooks.map(b => {
            return <Book book={b} key={b._id} />;
          })}
        </CardColumns>
      </>
    );
  }
}
BookIndex.propTypes = {
  search: propTypes.string
};
