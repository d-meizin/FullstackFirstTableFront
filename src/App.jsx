import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import axiosClient from './api/axiosClient';
import Login from './Login';

// Цвет ячейки в зависимости от владельца
const getOwnerColor = (owner) => {
  const o = (owner || '').toLowerCase();
  if (o === 'fil') return '#fff9c4'; // светло-жёлтый
  if (o === 'bob') return '#c8f7c5'; // светло-зелёный
  if (o === 'admin') return '#d3d3d3'; // серый
  return 'transparent';
};

function App() {
  // === Auth state ===
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // === Business state ===
  const [employees, setEmployees] = useState([]);
  const [employeeData, setEmployeeData] = useState({ name: '', manager: '', salary: '' });
  const [showCancel, setShowCancel] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // === Колонки таблицы ===
  const columns = useMemo(() => [
    { Header: 'EmployeeId', accessor: 'employeeId' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Manager', accessor: 'manager' },
    { Header: 'Salary', accessor: 'salary' },
    {
      Header: 'Owner',
      accessor: 'owner',
      // Красим всю ячейку в зависимости от владельца
      getCellProps: (cellInfo) => ({
        style: {
          backgroundColor: getOwnerColor(cellInfo.value),
          fontWeight: 'bold',
        },
      }),
    },
    {
      Header: 'Edit', id: 'Edit', accessor: 'edit', disableSortBy: true,
      Cell: ({ row }) => {
        const canEdit = currentUser?.role === 'admin'
          || currentUser?.username === row.original.owner;
        return (
          <button
            className="editBtn"
            onClick={() => handleUpdate(row.original)}
            disabled={!canEdit}
            title={canEdit ? 'Edit' : 'You can only edit your own records'}
          >
            Edit
          </button>
        );
      },
    },
    {
      Header: 'Delete', id: 'Delete', accessor: 'delete', disableSortBy: true,
      Cell: ({ row }) => {
        const canDelete = currentUser?.role === 'admin'
          || currentUser?.username === row.original.owner;
        return (
          <button
            className="deleteBtn"
            onClick={() => handleDelete(row.original)}
            disabled={!canDelete}
            title={canDelete ? 'Delete' : 'You can only delete your own records'}
          >
            Delete
          </button>
        );
      },
    },
  ], [currentUser]);

  // === Хук таблицы ===
  const {
    getTableProps, getTableBodyProps, headerGroups, page, prepareRow,
    state, setGlobalFilter, pageCount, nextPage, previousPage,
    canPreviousPage, canNextPage, gotoPage,
  } = useTable(
    { columns, data: employees, initialState: { pageSize: 5 } },
    useGlobalFilter, useSortBy, usePagination
  );
  const { globalFilter, pageIndex } = state;

  // === Проверка сессии при старте ===
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosClient.get('/auth/me');
        setCurrentUser(res.data);
        setIsAuth(true);
      } catch {
        setIsAuth(false);
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();

    // Реакция на 401 из перехватчика
    const onUnauthorized = () => {
      setIsAuth(false);
      setCurrentUser(null);
      setEmployees([]);
    };
    window.addEventListener('unauthorized', onUnauthorized);
    return () => window.removeEventListener('unauthorized', onUnauthorized);
  }, []);

  // === Загрузка сотрудников после логина ===
  useEffect(() => {
    if (isAuth) getAllEmployees();
  }, [isAuth]);

  // ===== API-вызовы =====
  const getAllEmployees = () => {
    axiosClient.get('/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error('Failed to load employees:', err));
  };

  const handleUpdate = (emp) => {
    setEmployeeData(emp);
    setShowCancel(true);
  };

  const handleDelete = async (emp) => {
    if (!window.confirm('Are you sure you want to Delete?')) return;
    try {
      await axiosClient.delete(`/employees/${emp.employeeId}`);
      getAllEmployees();
    } catch (err) {
      alert(err.response?.status === 403
        ? 'You can only delete your own records'
        : 'Error deleting employee');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');

    if (!employeeData.name || !employeeData.manager || !employeeData.salary) {
      setErrMsg('All fields are required!');
      return;
    }

    try {
      if (employeeData.employeeId) {
        await axiosClient.patch(`/employees/${employeeData.employeeId}`, employeeData);
      } else {
        await axiosClient.post('/employees', employeeData);
      }
      clearAll();
    } catch (err) {
      setErrMsg(err.response?.status === 403
        ? 'You can only edit your own records'
        : 'Error saving employee');
    }
  };

  const clearAll = () => {
    setEmployeeData({ name: '', manager: '', salary: '' });
    setShowCancel(false);
    getAllEmployees();
  };

  const handleCancel = () => {
    setEmployeeData({ name: '', manager: '', salary: '' });
    setShowCancel(false);
  };

  const handleChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
    setErrMsg('');
  };

  const handleLogout = async () => {
    try { await axiosClient.post('/auth/logout'); } catch { /* ignore */ }
    setIsAuth(false);
    setCurrentUser(null);
    setEmployees([]);
  };

  const handleLoginSuccess = async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      setCurrentUser(res.data);
      setIsAuth(true);
    } catch {
      setIsAuth(false);
    }
  };

  // ===== Условный рендеринг по авторизации =====
  if (checkingAuth) return <div className="loading">Checking authentication...</div>;
  if (!isAuth) return <Login onLogin={handleLoginSuccess} />;

  // ===== Основной интерфейс =====
  return (
    <>
      <div className="main-container">
        <div className="header-bar">
          <h3>Full Stack Application using React JS, Spring Boot & PostgreSQL</h3>
          <div className="user-info">
            <span className="current-user">
              👤 {currentUser?.username} ({currentUser?.role})
            </span>
            <button className="logoutBtn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {errMsg && <span className="error">{errMsg}</span>}

        <div className="add-panel">
          <div className="addpaneldiv">
            <label htmlFor="name">Name</label><br />
            <input className="addpanelinput" value={employeeData.name}
              type="text" onChange={handleChange} name="name" id="name" />
          </div>
          <div className="addpaneldiv">
            <label htmlFor="manager">Manager</label><br />
            <input className="addpanelinput" value={employeeData.manager}
              type="text" onChange={handleChange} name="manager" id="manager" />
          </div>
          <div className="addpaneldiv">
            <label htmlFor="salary">Salary</label><br />
            <input className="addpanelinput" value={employeeData.salary}
              type="text" onChange={handleChange} name="salary" id="salary" />
          </div>
          <button className="addBtn" onClick={handleSubmit}>
            {employeeData.employeeId ? 'Update' : 'Add'}
          </button>
          <button className="cancelBtn" disabled={!showCancel} onClick={handleCancel}>
            Cancel
          </button>
        </div>

        <input className="searchinput" value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          type="search" placeholder="Search Employee Here" />
      </div>

      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((hg) => (
            <tr {...hg.getHeaderGroupProps()} key={hg.id}>
              {hg.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                  {column.render('Header')}
                  <span>
                    {column.canSort && (
                      column.isSorted
                        ? column.isSortedDesc
                          ? <FaSortDown className="sort-icon" />
                          : <FaSortUp className="sort-icon" />
                        : <FaSort className="sort-icon" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={cell.id}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagediv">
        <button disabled={!canPreviousPage} className="pageBtn" onClick={() => gotoPage(0)}>First</button>
        <button disabled={!canPreviousPage} className="pageBtn" onClick={previousPage}>Prev</button>
        <span className="idx">{pageIndex + 1} of {pageCount}</span>
        <button disabled={!canNextPage} className="pageBtn" onClick={nextPage}>Next</button>
        <button disabled={!canNextPage} className="pageBtn" onClick={() => gotoPage(pageCount - 1)}>Last</button>
      </div>
    </>
  );
}

export default App;