import { useState } from 'react';
import './App.css';
import { useTable } from 'react-table';
import * as React from 'react';

function App() {

  const [employees, setEmployees] = useState([]);
  const columns = React.useMemo(() => [
    { Header: "EmployeeId", accessor: "employeeId" },
    { Header: "Name", accessor: "name" },
    { Header: "Manager", accessor: "manager" },
    { Header: "Salary", accessor: "salary" }
  ], []);

  const data = React.useMemo(() => employees, []);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: employees });

  return (
    <>

      <div className='main-container'>
        <h3>Full Stack Application using React JS, Spring Boot & PostgreSQL</h3>
        <div className='add-panel'>
          <div className='addpaneldiv'>
            <label htmlFor="name">Name</label> <br></br>
            <input className='addpanelinput' type="text" name="name" id="name" />
          </div>
          <div className='addpaneldiv'>
            <label htmlFor="manager">Manager</label> <br></br>
            <input className='addpanelinput' type="text" name="manager" id="manager" />
          </div>
          <div className='addpaneldiv'>
            <label htmlFor="salary">Salary</label> <br></br>
            <input className='addpanelinput' type="text" name="salary" id="salary" />
          </div>
          <button className='addBtn'>Add</button>
          <button className='cancelBtn'>Cancel</button>
        </div>
        <input className='searchinput' type="search" name="inputsearch" id="inputsearch" placeholder='Search Employee Here' />
      </div>
      <table className='table' {...getTableProps()}>
        <thead>
          {headerGroups.map((hg) => (
            <tr {...hg.getHeaderGroupProps()} key={hg.id}>
              {hg.headers.map((column) => (
                <th {...column.getHeaderProps()} key={column.id}> {column.render("Header")} </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <tr>
            <td></td>
          </tr>
        </tbody>
      </table>

    </>
  )
}

export default App
