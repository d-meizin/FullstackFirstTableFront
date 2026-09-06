import { useState } from 'react';
import './App.css';
import { useTable } from 'react-table';
import * as React from 'react';
import axios from "axios";

function App() {

  const [employees, setEmployees] = useState([]);
  const columns = React.useMemo(() => [
    { Header: "EmployeeId", accessor: "employeeId" },
    { Header: "Name", accessor: "name" },
    { Header: "Manager", accessor: "manager" },
    { Header: "Salary", accessor: "salary" },
    {
      Header: "Edit", id: "Edit", accessor: "edit",
      Cell: props => (<button className='editBtn' onClick={() => handleUpdate(props.cell.row.original)}>Edit</button>)
    },
    {
      Header: "Delete", id: "Delete", accessor: "delete",
      Cell: props => (<button className='deleteBtn'>Delete</button>)
    }
  ], []);

  const data = React.useMemo(() => employees, []);
  const [employeeData, setEmployeeData] = useState({ name: "", manager: "", salary: "" });
  const [showCancel, setShowCancel] = useState(false);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow }
    = useTable({ columns, data: employees });

  const getAllEmployees = () => {
    axios.get("http://localhost:8085/employees").then((res) => {
      console.log(res.data);
      setEmployees(res.data);
    });
  }

  const handleUpdate = (emp) => {
    setEmployeeData(emp);
    setShowCancel(true);
  }

  const clearAll = () => {
    setEmployeeData({ name: "", manager: "", salary: "" });
    getAllEmployees();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8085/employees", employeeData).then((res) => {
      console.log(res.data);
    });
    clearAll();
  }

  const handleCancel = () => {
    setEmployeeData({ name: "", manager: "", salary: "" });
    setShowCancel(false);
  }

  const handleChangle = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
  }

  React.useEffect(() => {
    getAllEmployees();
  }, []);

  return (
    <>

      <div className='main-container'>
        <h3>Full Stack Application using React JS, Spring Boot & PostgreSQL</h3>
        <div className='add-panel'>
          <div className='addpaneldiv'>
            <label htmlFor="name">Name</label> <br></br>
            <input className='addpanelinput' value={employeeData.name} type="text" onChange={handleChangle} name="name" id="name" />
          </div>
          <div className='addpaneldiv'>
            <label htmlFor="manager">Manager</label> <br></br>
            <input className='addpanelinput' value={employeeData.manager} type="text" onChange={handleChangle} name="manager" id="manager" />
          </div>
          <div className='addpaneldiv'>
            <label htmlFor="salary">Salary</label> <br></br>
            <input className='addpanelinput' value={employeeData.salary} type="text" onChange={handleChangle} name="salary" id="salary" />
          </div>
          <button className='addBtn' onClick={handleSubmit}>{employeeData.employeeId ? "Update" : "Add"}</button>
          <button className='cancelBtn' disabled={!showCancel} onClick={handleCancel}>Cancel</button>
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
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (<tr {...row.getRowProps()} key={row.id} >
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()} key={cell.id}> {cell.render("Cell")}</td>
              ))}

            </tr>)
          })}
        </tbody>
      </table >

    </>
  )
}

export default App
