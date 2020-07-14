import React, { useState, useEffect } from "react";
import "./CSS/App.css";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import "./CSS/bootstrap.css";
import axios from 'axios'
import NavBar from "./Navbar.jsx"
import Video from "./video.jsx"
import defaultThumbnail from "./Assets/defaultVideo.png"
import Grid from '@material-ui/core/Grid';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import PlaylistVideo from './playlistVideo.jsx'
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import 'query-string'
import { parse } from "query-string";
import Cookies from 'universal-cookie';

const url = "http://127.0.0.1:5000"
const playlistID = "PLyp73GSQkAGm7PBAI37oI8b0axk_YFYf0"

function displayVideos(videos) {
    return videos.map((video) => (
        Video(video.thumbnail.includes(".jpg") ? video.thumbnail : defaultThumbnail, video.title, video.views, video.publish_time, video.id, playlistID)
    ));
}

function displayPlaylistVideos(videos) {
    return videos.map((video) => (
        PlaylistVideo(video.thumbnail.includes(".jpg") ? video.thumbnail : defaultThumbnail, video.title, video.views, video.publish_time, video.id, video.playlistvideo_id)
    ));
}

function App() {
    const [videos, setVideos] = useState([]);
    const [playlistVideos, setPlaylistVideos] = useState([]);
    const [startDate, setDate] = useState(new Date());

    function getVideos() {
        axios.get(url + "/videos")
            .then(response => setVideos(response.data))
            .catch(err => console.error(err))
    }

    function getVideosByViews() {
        axios.get(url + "/videosByViews")
            .then(response => setVideos(response.data))
            .catch(err => console.error(err))
    }

    // Sorting by Likes
    function getVideosByLikes() {
        axios.get(url + "/videosByLikes")
            .then(response => setVideos(response.data))
            .catch(err => console.error(err))
    }

    // Sorting by likes ratio
    function getVideosByLikesRatio() {
        axios.get(url + "/videosByLikesRatio")
            .then(response => setVideos(response.data))
            .catch(err => console.error(err))
    }

    // Sorting by Country with key being the string of the country
    function getVideosByCountry(key) {
        axios.get(url + "/videosTrendingByCountry", {
            params: {
                country: key
            }
        })
            .then(response => setVideos(response.data))
            .catch(err => console.error(err))
    }

    function getVideosByDate(key) {
        key.setHours(-4) //To convert hour to midnight
        axios.get(url + "/videosOnDate", {
            params: {
                date: key.toUTCString()
            }
        })
            .then(response => setVideos(response.data))
            .catch(err => console.error(err))
    }

    function getPlaylistVideos() {
        axios.get(url + "/playlist-videos", {
            params: {
                id: playlistID
            }
        })
            .then(response => setPlaylistVideos(response.data))
            .catch(err => console.error(err))
    }

    function updateDBWithYoutubeAPI() {
        axios.get(url + "/load-videos")
            .catch(err => console.error(err))
    }

    useEffect(() => {
        getVideos();
        // getPlaylistVideos();
    }, []);

    function videosPage() {
        return (
            <div>
                <div className="filters">
                    <h3>Filters</h3>
                    <Grid container xs={3} sm spacing={1}>
                        <Grid item>
                            <Button variant="dark" className="filterButton" onClick={() => getVideos()}>Unsorted</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="dark" className="filterButton" onClick={() => getVideosByViews()}>Sort by Views</Button>
                        </Grid>
                        <Grid item>
                            {/* untested */}
                            <Button variant="dark" className="filterButton" onClick={() => getVideosByLikes()}>Sort by Likes</Button>
                        </Grid>
                        <Grid item>
                            {/* <Button variant="dark" className="filterButton" onClick={() => getVideosByLikesRatio()}>Sort by Likes Ratio</Button> */}
                        </Grid>
                        <Grid item>
                            <Button variant="warning" className="filterButton" onClick={() => updateDBWithYoutubeAPI()}>Update DB with Youtube API</Button>
                        </Grid>
                        <Grid item>
                            {/* untested */}
                            <Dropdown onSelect={(key, evt) => getVideosByCountry(key, evt)}>
                                <Dropdown.Toggle variant="dark" id="dropdown-basic" >
                                    Sort By Trending Country
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => getVideosByCountry("US")}>US</Dropdown.Item>
                                    <Dropdown.Item onClick={() => getVideosByCountry("CA")}>Canada</Dropdown.Item>
                                    <Dropdown.Item onClick={() => getVideosByCountry("JP")}>Japan</Dropdown.Item>
                                    <Dropdown.Item onClick={() => getVideosByCountry("RU")}>Russia</Dropdown.Item>
                                    <Dropdown.Item onClick={() => getVideosByCountry("MX")}>Mexico</Dropdown.Item>
                                    <Dropdown.Item onClick={() => getVideosByCountry("KR")}>South Korea</Dropdown.Item>
                                    <Dropdown.Item onClick={() => getVideosByCountry("IN")}>India</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Grid>
                        {/* untested */}
                        <Grid item>
                            <DayPickerInput placeholder={"Sort By Publish Date"} onDayChange={formattedVal => getVideosByDate(formattedVal)} />
                        </Grid>
                    </Grid>
                </div>
                <div className="videosCollection">
                    <Grid container xs={3} sm spacing={2} style={{ padding: "8px", marginLeft: "16px" }}>
                        {displayVideos(videos)}
                    </Grid>
                </div>
            </div>
        );
    }

    function playlistPage() {
        return (
            <div>
                <div className="playlist">
                    <h3>Playlist</h3>
                    <Button variant="dark" className="playlistButton" onClick={() => getPlaylistVideos()}>Update</Button>
                </div>
                <div className="videosCollection">
                    <Grid container xs={3} sm spacing={2} style={{ padding: "8px", marginLeft: "16px" }}>
                        {displayPlaylistVideos(playlistVideos)}
                    </Grid>
                </div>
            </div>
        );
    }

    function auth() {
        const cookies = new Cookies();
        let user_data = parse(window.location.search)
        if (user_data.id && user_data.name) {
            cookies.set('user_id', user_data.id);
            cookies.set('user_name', user_data.name);
        }
        return <Redirect to='/' />
    }

    return (
        <div className="App">
            <NavBar />
            <Router>
                <Switch>
                    <Route exact path="/videos">
                        {videosPage()}
                    </Route>
                    <Route exact path="/playlist">
                        {playlistPage()}
                    </Route>
                    <Route exact path="/authorize">
                        {auth()}
                    </Route>
                    <Route path="/">
                        {videosPage()}
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
