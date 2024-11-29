let songs = []
let folder = "Natt"
async function getSongs() {
    
    let a = await fetch(`https://github.com/tafseerali/testspotify2/tree/main/songs/${folder}`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let songName = element.href.split(`/songs/`)[1].split("/")[1].replaceAll(".mp3", "").split("-")[0]
            songs.push({ name: songName, url: element.href });
        }
    }
    return songs
}
// Funtion to handle volume
function volume(value) {
    value = document.querySelector(".inputVolumeOn").value / 100
    currentSong.volume = value
}
let currentSong = new Audio()
let playMusic = (track => {
    if (localStorage.getItem("isLoggedIn") === "true") {
        if (!track.startsWith("https://") && !track.startsWith("http://")) {
            track = `https://github.com/tafseerali/Songs-File/tree/main/songs/${folder}` + track;
        }
        currentSong.src = track;
        currentSong.play();
        play.src = "img/pauseSong.svg";
    } else {
        showNotification("signinRequired");
    }
});
function formatTime(currentSeconds, totalSeconds) {
    function format(seconds) {
        let minutes = Math.floor(seconds / 60);
        let secs = Math.floor(seconds % 60);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        secs = secs < 10 ? "0" + secs : secs;
        return `${minutes}:${secs}`;
    }
    // Check if either currentSeconds or totalSeconds is NaN
    if (isNaN(currentSeconds) || isNaN(totalSeconds)) {
        return "00:00 / 00:00";
    }
    return `${format(currentSeconds)} / ${format(totalSeconds)}`;
}
async function main() {

    async function updateSongsListLi() {
        songs = await getSongs(folder)
        let songUL = document.querySelector(".songList ul");

        songUL.innerHTML = "";
        for (let song of songs) {
            songUL.innerHTML = songUL.innerHTML += `<li class="flex align-center songListLi" data-url = ${song.url}>
                                <img class="invert libraryMusicImg" src="img/music.svg" alt="music">
                                <div class="info ">
                                    <div class="libraryLiName">${decodeURIComponent(song.name)}</div>
                                    <div>Artist</div>
                                </div>
                                <div class="flex align-center play">
                                    <span>Play Now</span>
                                    <img class="invert songListImg" src="img/play.svg" alt="play">
                                </div>
                            </li>`;
        }
        let elements = songUL.querySelectorAll("li")
        elements.forEach(element => {
            element.addEventListener("click", () => {
                if (localStorage.getItem("isLoggedIn") === "true") {
                    document.querySelector(".playbar").style.visibility = "visible";
                    document.querySelector(".playbar").style.display = "flex";
                    document.querySelector(".playbar").style.opacity = "1";

                    // Remove 'active' class from all list items
                    elements.forEach(el => {
                        el.classList.remove("active");
                    });

                    element.classList.add("active");
                } else {
                    document.querySelector(".playbar").style.display = "none";
                }
            });
        });
        // Add click event listeners to each song in the list
        Array.from(songUL.querySelectorAll(".songListLi")).forEach(e => {
            e.addEventListener("click", element => {
                let songUrl = e.getAttribute("data-url")
                playMusic(songUrl)
                document.querySelector(".songInfo").innerHTML = e.querySelector(".info").firstElementChild.textContent

                // Download button code
                if (localStorage.getItem("isLoggedIn") === "true") {
                    let downloadButton = document.querySelector(".download")
                    downloadButton.style.display = "flex"
                    downloadButton.addEventListener('click', () => {
                        const a = document.createElement('a');
                        a.href = currentSong.src; // The song URL stored in currentsong.src
                        a.download = 'song.mp3'; // Set the desired file name
                        a.click();
                    });
                }
            })
        })
    }
    // Fetch album information and add event listeners to cards
    fetch("info.json")
        .then(response => response.json())
        .then(data => {
            let cardContainer = document.querySelector(".cardContainer")
            data.albums.forEach(album => {
                // create the card element
                const card = document.createElement("div")
                card.classList.add("card")
                // Add the svg svgIcon
                const svgContainer = document.createElement("div")
                svgContainer.classList.add("svg-container")
                svgContainer.innerHTML = `<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                                class="Svg-sc-ytk21e-0 bneLcE">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>`
                card.appendChild(svgContainer)
                // Add the album cover
                const img = document.createElement("img")
                img.src = album.cover
                card.appendChild(img)
                //Add the heading
                const heading = document.createElement("h2")
                heading.classList.add("cardHeading")
                heading.textContent = album.name
                card.appendChild(heading)
                // Add the card paragraph
                const p = document.createElement("p")
                p.textContent = album.paragraph
                card.appendChild(p)
                // Add evenlister to the card
                card.addEventListener("click", () => {
                    folder = album.name
                    updateSongsListLi()
                })

                cardContainer.appendChild(card)
            })
            // Invoke the hover styling on cards
            cardHoverStyles()
            // Initialize with the first album (e.g., "album1")
            folder = data.albums[0]?.name || ""; // Default to the first album
            updateSongsListLi(); // Load songs for the first album
        })
        .catch(error => console.error("Error loading JSON:", error));
    document.querySelector(".songInfo").style.fontSize = "17px"
    function updateSongNameOnplaybar(url) {
        let songList = document.querySelector(".songList").getElementsByTagName("li")
        let activeSong = Array.from(songList).find(song => song.getAttribute("data-url") === url)
        document.querySelector(".songInfo").innerHTML = activeSong.querySelector(".info").firstElementChild.textContent
    }
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pauseSong.svg"
        }
        else {
            play.src = "img/playSong.svg"
            currentSong.pause()
        }
    })
    // Previous button
    function previousButtonUpdate() {
        document.querySelector("#previous").style.cursor = "pointer";
        document.querySelector("#previous").addEventListener("click", () => {
            let index = songs.findIndex(song => song.url === currentSong.src)  // Using findIndex()
            // let index = songs.reduce((acc, song, i)=>{                    // Using reduce method
            //     return song.url === currentSong.src ? i: acc
            // },-1)
            if (index - 1 < 0) {
                console.log("Nothing in previous")
            }
            else {
                playMusic(songs[index - 1].url)
                updateActiveElement(songs[index - 1].url)
                updateSongNameOnplaybar(songs[index - 1].url)
            }
        })
    }
    // Next button
    function nextButtonUpdate() {
        document.querySelector("#next").style.cursor = "pointer";
        document.querySelector("#next").addEventListener("click", () => {
            let index = songs.findIndex(song => song.url === currentSong.src)  // Using findIndex()
            if (index + 1 >= songs.length) {
                console.log("Nothing in next")
            }
            else {
                playMusic(songs[index + 1].url)
                updateActiveElement(songs[index + 1].url)
                updateSongNameOnplaybar(songs[index + 1].url)
            }
        })
    }
    previousButtonUpdate()
    nextButtonUpdate()
    // Timestamp update
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    document.querySelector(".songTime").style.fontSize = "17px";
    currentSong.addEventListener("timeupdate", () => {
        if (currentSong.currentTime == currentSong.duration) {
            play.src = "img/playSong.svg"
            currentSong.pause()
        }
        document.querySelector(".songTime").innerHTML = formatTime(currentSong.currentTime, currentSong.duration);
        document.querySelector(".circle").style.left = (- 0.5 + ((currentSong.currentTime / currentSong.duration) * 100)) + "%"
    });
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width * 100)
        document.querySelector(".circle").style.left = (-0.5 + percent) + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })
    // Funtion for updating the class on previous and next button
    function updateActiveElement(url) {
        let elements = document.querySelectorAll(".songListLi")
        elements.forEach(element => {
            element.classList.remove("active")
        })
        let activeElement = Array.from(elements).find(element => element.getAttribute("data-url") === url)
        if (activeElement) {
            activeElement.classList.add("active")
        }
    }
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
        document.querySelector(".right").style.visibility = "hidden"
    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".right").style.visibility = "visible"
    })
    const leftSvg = document.querySelector("#leftSvg");
    const rightSvg = document.querySelector("#rightSvg");
    leftSvg.style.cursor = "pointer";
    rightSvg.style.cursor = "pointer";
    // handling volume buttons
    document.querySelector(".volumeOffImg").style.display = "none";
    document.querySelector(".inputVolumeOff").style.display = "none";
    document.querySelector(".volumeOnImg").addEventListener("click", () => {
        currentSong.volume = 0;
        document.querySelector(".volumeOnImg").style.display = "none";
        document.querySelector(".volumeOffImg").style.display = "flex";
        document.querySelector(".inputVolumeOn").style.display = "none"
        document.querySelector(".inputVolumeOff").style.display = "flex"
    })
    document.querySelector(".volumeOffImg").addEventListener("click", () => {
        document.querySelector(".volumeOffImg").style.display = "none"
        document.querySelector(".volumeOnImg").style.display = "flex"
        document.querySelector(".inputVolumeOff").style.display = "none";
        document.querySelector(".inputVolumeOn").style.display = "flex";
        currentSong.volume = 1;
    })
    // Funtion to handle color track on the runway with thumb
    const volumeSlider = document.querySelector('.inputVolumeOn');
    volumeSlider.value = 50;
    function updateSliderBackground() {
        let value = volumeSlider.value;
        const max = volumeSlider.max || 100;
        const percentage = (value / max) * 100;
        // Update the background gradient
        volumeSlider.style.background = `linear-gradient(to right, orange ${percentage}%, black ${percentage}%)`;
        volume(value)
    }
    updateSliderBackground();
    volumeSlider.addEventListener('input', updateSliderBackground);
    // Login and signup button forms setup
    let signandlog = document.querySelector(".signandlog");
    let signupContainer = document.querySelector(".signupContainer");
    let loginContainer = document.querySelector(".loginContainer");
    // Show Signup Form
    document.querySelector(".signUp").addEventListener("click", () => {
        signupContainer.style.display = "flex";
        signandlog.style.visibility = "visible";
        document.querySelector(".container").style.opacity = "0.4"
    });

    // Show Login Form
    document.querySelector(".logIn").addEventListener("click", () => {
        loginContainer.style.display = "flex";
        signandlog.style.visibility = "visible";
        document.querySelector(".container").style.opacity = "0.7"
    });
    // Close the respective form when clicking outside
    signandlog.addEventListener("click", function (event) {
        if (!signupContainer.contains(event.target) && !loginContainer.contains(event.target)) {
            signupContainer.style.display = "none";
            loginContainer.style.display = "none";
            signandlog.style.visibility = "hidden";
            document.querySelector(".container").style.opacity = "1"
        }
    });
    function showSignupSuccess(loggedMessage) {
        const message = document.getElementById(loggedMessage);

        // Show the notification
        message.classList.add("show");

        // Hide after 1 second
        setTimeout(() => {
            message.classList.remove("show");
        }, 3000);
    }
    // Call this function after successful signup
    document.querySelector(".auth-button-sign-up").addEventListener("click", function (e) {
        e.preventDefault();
        // Assuming signup logic goes here...
        let username = document.querySelector("#username").value
        let email = document.querySelector("#email").value
        let password = document.querySelector("#password").value
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ username, email, password })
        localStorage.setItem('users', JSON.stringify(users))
        document.querySelector(".auth-container").style.display = "none"
        document.querySelector(".container").style.opacity = "1"
        document.querySelector(".signandlog").style.visibility = "hidden";
        // Show the success card
        showSignupSuccess("signupSuccess");
    });
    document.querySelector(".auth-button-log-in").addEventListener("click", function (e) {
        e.preventDefault()
        let loginUsername = document.querySelector("#loginUsername").value;
        let loginPassword = document.querySelector("#loginPassword").value;
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let userFound = users.some(user => user.username === loginUsername && user.password === loginPassword);
        if (userFound) {
            localStorage.setItem("isLoggedIn", "true")
            toggleAuthButtons()
            showSignupSuccess("loggedIn")
            //Styls for container opacity and signandlog visibility
            document.querySelector(".signandlog").style.visibility = "hidden";
            document.querySelector(".container").style.opacity = "1";
        } else {
            showNotification("invalidCredentials");
        }
    });
    // funtions to check if log in or not
    // Prevent closing when clicking inside the signup form
    signupContainer.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents the click event from reaching the signandlog container
    });
    // Prevent closing when clicking inside the login form
    loginContainer.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents the click event from reaching the signandlog container
    });
}
main()
function toggleAuthButtons() {
    // Button Elements
    const logInButton = document.querySelector(".logIn");
    const signUpButton = document.querySelector(".signUp");
    const logoutButton = document.querySelector(".logout-button");
    if (localStorage.getItem('isLoggedIn') === 'true') {
        logInButton.style.display = "none";
        signUpButton.style.display = "none";
        logoutButton.style.display = "flex"; // Keeps alignment intact in a flex container
        document.querySelector(".loginContainer").style.display = "none"
        document.querySelector(".loginContainer").style.display = "none"
        document.querySelector(".playbar").style.transition = "all 1s ease-out"
    } else {
        logInButton.style.display = "flex";
        signUpButton.style.display = "flex";
        logoutButton.style.display = "none";
        // stop music and hide playbar
        currentSong.pause()
        document.querySelector(".playbar").style.visibility = "hidden"
        document.querySelector(".playbar").style.transition = "none"
        // Hide download button
        document.querySelector(".download").style.display = "none"
    }
    // Remove active class from lists
    let elements = document.querySelectorAll(".songListLi")
    elements.forEach(element => {
        element.classList.remove("active")
    })
}
// Handle Logout
document.querySelector(".logout-button").addEventListener("click", () => {
    // Update logged-in status
    localStorage.setItem('isLoggedIn', "false");
    // Update buttons
    toggleAuthButtons();
    // alert("You have logged out successfully!");
    showNotification("loggedOut")
});
// Initialize button visibility on page load
toggleAuthButtons();
function showNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (!notification) {
        console.error(`Notification with id "${notificationId}" not found in the DOM.`);
        return;
    }
    // Add the 'show' class to display the notification
    notification.classList.add("show");
    // Remove the 'show' class after 1 second (or more)
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
function cardHoverStyles() {
    const card = document.querySelectorAll(".card")
    card.forEach(eachCard => {
        // Function to add hover effect
        eachCard.addEventListener('mouseenter', () => {
            svgContainer = eachCard.querySelector(".svg-container")
            if (window.innerWidth <= 750) {
                svgContainer.style.top = "210px"
                svgContainer.style.opacity = "1"
            }
            else {
                svgContainer.style.top = '95px';
                svgContainer.style.opacity = '1';
            }
        });
        // Function to remove hover effect
        eachCard.addEventListener('mouseleave', () => {
            svgContainer = eachCard.querySelector(".svg-container")
            svgContainer.style.top = '';
            svgContainer.style.opacity = '';
        });
    })
}
// Select all heading elements (divs with class 'heading')
const headingElements = document.querySelectorAll('.library .heading');
// Function to handle the hover effect for both h2 and img
headingElements.forEach(heading => {
    const h2 = heading.querySelector('h2');
    const img = heading.querySelector('img');
    // When the mouse enters either the img or h2, apply the opacity effect
    img.addEventListener('mouseenter', () => {
        h2.style.opacity = '0.5';  // Change opacity of h2
        img.style.opacity = '0.5'; // Change opacity of img
    });
    h2.addEventListener('mouseenter', () => {
        h2.style.opacity = '0.5';  // Change opacity of h2
        img.style.opacity = '0.5'; // Change opacity of img
    });
    // Reset the opacity when the mouse leaves either the img or h2
    img.addEventListener('mouseleave', () => {
        h2.style.opacity = '';  // Reset opacity of h2
        img.style.opacity = ''; // Reset opacity of img
    });
    h2.addEventListener('mouseleave', () => {
        h2.style.opacity = '';  // Reset opacity of h2
        img.style.opacity = ''; // Reset opacity of img
    });
});