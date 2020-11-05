import React, {useEffect, useState} from "react";
import request from "../utils/request";
import endpoints from "../endpoints.json";
import {useAuth0} from "@auth0/auth0-react";
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {lighten, makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import LockIcon from '@material-ui/icons/Lock';
import {Modal} from "react-bootstrap";
import Button from "@material-ui/core/Button";
import putRequest from "../utils/putRequest";
import deleteRequest from "../utils/deleteRequest";
import {useSnackbar} from "notistack";

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {id: 'id', numeric: false, disablePadding: true, label: 'Id'},
    {id: 'firstname', numeric: true, disablePadding: false, label: 'Firstname'},
    {id: 'lastname', numeric: true, disablePadding: false, label: 'Lastname'},
    {id: 'email', numeric: true, disablePadding: false, label: 'Email'},
    {id: 'phone', numeric: true, disablePadding: false, label: 'Phone'},
    {id: 'isCreator', numeric: true, disablePadding: false, label: 'IsCreator'},
    {id: 'isBlocked', numeric: true, disablePadding: false, label: 'IsBlocked'},
    {id: 'ref_auth', numeric: true, disablePadding: false, label: 'Ref Auth'},
];

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
    const {classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{'aria-label': 'select all desserts'}}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'center'}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    title: {
        flex: '1 1 100%',
    },
}));

const EnhancedTableToolbar = (props) => {
    const classes = useToolbarStyles();
    const {usersSelected, setSelected, setUsersListRefresh} = props;
    let [showDeleteUsersModal, setShowDeleteUsersModal] = useState(false);
    let [showBlockUsersModal, setShowBlockUsersModal] = useState(false);

    const {enqueueSnackbar} = useSnackbar();

    const {getAccessTokenSilently} = useAuth0();

    //Methods Delete and Put
    let updateUser = async (userToUpdate) => {
        return await putRequest(`${process.env.REACT_APP_SERVER_URL}${endpoints.user}/${userToUpdate.id}`, getAccessTokenSilently, JSON.stringify(userToUpdate));
    };
    let deleteUser = async (userToDelete) => {
        return await deleteRequest(`${process.env.REACT_APP_SERVER_URL}${endpoints.user}/${userToDelete.id}`, getAccessTokenSilently);
    };

    let handleDeleteUsersClick = (event) => {
        event.preventDefault();
        setShowDeleteUsersModal(true);

    }
    let handleCloseDeleteUsersModal = (event) => {
        event.preventDefault();
        setShowDeleteUsersModal(false);
    }
    let handleBlockUsersClick = (event) => {
        event.preventDefault();
        setShowBlockUsersModal(true);

    }
    let handleCloseBlockUsersModal = (event) => {
        event.preventDefault();
        setShowBlockUsersModal(false);
    }


    let blockUsers = (event) => {
        event.preventDefault();
        usersSelected.forEach(userToUpdate => {
            userToUpdate.isBlocked = !userToUpdate.isBlocked;
            const response = updateUser(userToUpdate).then(() => {
                if (userToUpdate.id === usersSelected[usersSelected.length - 1].id) {//Refresh the list only once
                    setSelected([]);
                    setUsersListRefresh(true);
                    enqueueSnackbar("Users successfully updated", {variant: 'success'});
                }
            });
        });

        setSelected([]);
        setShowBlockUsersModal(false);
    }
    let deleteUsers = (event) => {
        event.preventDefault();
        usersSelected.forEach(userToDelete => {
            if (userToDelete.isCreator) {
                enqueueSnackbar("The user " + userToDelete.id + " is a creator. Delete his locations first !", {variant: 'error'});
                if (userToDelete.id === usersSelected[usersSelected.length - 1].id) {
                    setSelected([]);
                    setUsersListRefresh(true);
                }
            } else {
                const response = deleteUser(userToDelete).then(() => {
                    if (userToDelete.id === usersSelected[usersSelected.length - 1].id) {//Refresh the list only once
                        enqueueSnackbar("Users successfully deleted", {variant: 'success'});
                        setSelected([]);
                        setUsersListRefresh(true);
                    }
                });
            }
        });
        setShowDeleteUsersModal(false);
    }

    return (
        <Toolbar
            className={clsx(classes.root, {
                [classes.highlight]: usersSelected.length > 0,
            })}
        >
            {usersSelected.length > 0 ? (
                <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
                    {usersSelected.length} selected
                </Typography>
            ) : (
                <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
                    Users
                </Typography>
            )}

            {usersSelected.length > 0 ? (
                <>
                    <Tooltip title="Delete">
                        <IconButton aria-label="delete" onClick={handleDeleteUsersClick}>
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Block">
                        <IconButton aria-label="block" onClick={handleBlockUsersClick}>
                            <LockIcon/>
                        </IconButton>
                    </Tooltip>
                </>
            ) : null}
            {showDeleteUsersModal ? (
                <Modal show={true} onHide={handleCloseDeleteUsersModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete {usersSelected.length} User(s)</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>This action will delete {usersSelected.length} user(s) from the database. This action is
                            irreversible ! </p>
                        <p>Are you sure to remove them ?</p>
                        <Button variant="outlined" color="default" onClick={deleteUsers}>Yes</Button>
                        <Button variant="outlined" color="secondary" onClick={handleCloseDeleteUsersModal}
                                style={{marginLeft: '1em'}}>No</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" color="secondary" onClick={handleCloseDeleteUsersModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            ) : null}
            {showBlockUsersModal ? (
                <Modal show={true} onHide={handleCloseBlockUsersModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Block {usersSelected.length} User(s)</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>This action will reverse the current status "isBlocked" for the users choosed. Do you want to
                            continue ? </p>
                        <Button variant="outlined" color="default" onClick={blockUsers}>Yes</Button>
                        <Button variant="outlined" color="secondary" onClick={handleCloseBlockUsersModal}
                                style={{marginLeft: '1em'}}>No</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" color="secondary" onClick={handleCloseBlockUsersModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            ) : null}

        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    usersSelected: PropTypes.array.isRequired,
    setUsersListRefresh: PropTypes.func.isRequired,
};

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 750,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

export default function UsersList() {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(8);
    const [usersListRefresh, setUsersListRefresh] = React.useState(true);

    let [users, setUsers] = useState([]);
    let {getAccessTokenSilently} = useAuth0();


    useEffect(() => {
        let getAllUsers = async (e) => {
            let users = await request(
                `${process.env.REACT_APP_SERVER_URL}${endpoints.user}`, getAccessTokenSilently);
            if (users !== null) {
                setUsers(users);
            }
        }
        if (usersListRefresh) {
            getAllUsers().catch();
            setUsersListRefresh(false);
        }

    }, [usersListRefresh]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = users.map((user) => user);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, row) => {
        const selectedIndex = selected.indexOf(row);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, row);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (row) => selected.indexOf(row) !== -1;

    //const emptyRows = rowsPerPage - Math.min(rowsPerPage, users.length - page * rowsPerPage);


    return (
        <>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar usersSelected={selected} setSelected={setSelected}
                                      setUsersListRefresh={setUsersListRefresh}/>
                <TableContainer style={{height: "500px"}}>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            classes={classes}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={users.length}
                        />
                        <TableBody>
                            {stableSort(users, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const isItemSelected = isSelected(row);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => handleClick(event, row)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.id}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    inputProps={{'aria-labelledby': labelId}}
                                                />
                                            </TableCell>
                                            <TableCell component="th" id={labelId} scope="row" padding="none">
                                                {row.id}
                                            </TableCell>
                                            <TableCell align="left">{row.firstname}</TableCell>
                                            <TableCell align="left">{row.lastname}</TableCell>
                                            <TableCell align="left">{row.email}</TableCell>
                                            <TableCell align="left">{row.phone}</TableCell>
                                            <TableCell align="center">{row.isCreator ? "true" : "false"}</TableCell>
                                            <TableCell align="center">{row.isBlocked ? "true" : "false"}</TableCell>
                                            <TableCell align="left">{row.ref_Auth}</TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[8, 20, 50]}
                    component="div"
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    );

}