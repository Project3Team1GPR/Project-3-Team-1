import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { QUERY_GET_ME } from "../../utils/queries";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Modal, Tab } from "react-bootstrap";
import SignUpForm from "../SignupForm";
import LoginForm from "../LoginForm";
import { useGlobalContext } from "../../utils/GlobalState";
import Auth from "../../utils/auth";

const AppNavbar = () => {
  const [getUser, { loading, error, data }] = useLazyQuery(QUERY_GET_ME);
  // set modal display state
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useGlobalContext();

  useEffect(() => {
    console.log("STATUS", user, Auth.loggedIn());
    if (user?._id) {
      setShowModal(false);
    }
  }, [user]);

  useEffect(() => {
    if (Auth.loggedIn() && !user?._id) {
      console.log("GETTING PROFILE");
      getUserFromDb();
    }
  }, []);

  const getUserFromDb = async () => {
    console.log("Really getting profile");
    const userFromDb = (await getUser()).data.me;
    console.log("Got PRofile", userFromDb);
    setUser(userFromDb);
  };

  const handleLinkClick = () => {
    setShowModal(false); // Close the modal when a link is selected
    document.querySelector(".navbar-toggler").click(); // Close the navbar toggler in responsive mode
  };

  const handleLoginSignupClick = () => {
    setShowModal(true); // Open the modal for Login/Sign Up
    document.querySelector(".navbar-toggler").click(); // Close the navbar toggler in responsive mode
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="fs-5">
        <Container fluid>
          <Navbar.Brand className="fs-3" as={Link} to="/">
            <img
              src="/images/hhu.jpg"
              width="30"
              height="30"
              className="d-inline-block align-middle me-2"
              alt="HHU Logo"
            />
            HAPPY HOUR UNCODED
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar" className="flex-row-reverse">
            <Nav className="ml-auto d-flex">
              <Nav.Link as={Link} to="/about" onClick={handleLinkClick}>
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/search" onClick={handleLinkClick}>
                Cocktails
              </Nav.Link>
              {/* if user is logged in show saved cocktails and logout */}
              {Auth.loggedIn() ? (
                <>
                  <Nav.Link as={Link} to="/post" onClick={handleLinkClick}>
                    Post
                  </Nav.Link>
                  <Nav.Link as={Link} to="/saved" onClick={handleLinkClick}>
                    Your Cocktails
                  </Nav.Link>
                  <Nav.Link onClick={Auth.logout}>Logout</Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={handleLoginSignupClick}>
                  Login/Sign Up
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* set modal data up */}
      <Modal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby="signup-modal"
      >
        {/* tab container to do either signup or login component */}
        <Tab.Container defaultActiveKey="login">
          <Modal.Header closeButton>
            <Modal.Title id="signup-modal">
              <Nav variant="pills">
                <Nav.Item>
                  {/* modal button colors HERE will have to figure out active an inactive*/}
                  <Nav.Link
                    // style={{ backgroundColor: "black" }}
                    eventKey="login"
                  >
                    Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="signup">Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey="login">
                <LoginForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey="signup">
                <SignUpForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </Modal>
    </>
  );
};

export default AppNavbar;
