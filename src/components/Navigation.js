import { useContext } from 'react'
import Nav from 'react-bootstrap/Nav'
import { NavLink } from 'react-router-dom'
// contexts
import { NavContext } from '../context/NavContext'

export function Navigation (props) {
  const NavigationItems = useContext( NavContext )
  const Items = NavigationItems.map( (item) => {
    return (
      <Nav.Item>
        <Nav.Link as={NavLink} to={item.goto}>{item.name}</Nav.Link>
      </Nav.Item>
    )
  })

  return (
    <Nav>
      { Items }
    </Nav>
  )
} 