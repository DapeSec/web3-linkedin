import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/LinkedInPortal.json';
import twitterLogo from './assets/twitter-logo.svg';

  // Constants
  const TWITTER_HANDLE = 'Dape25';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
  const contractAddress = "0xd606c77b9a9009940f4063878F7714771Fc01c49";
  const contractABI = abi.abi;

  const App = () => {
    // States
    const [currentAccount, setCurrentAccount] = useState("");
    const [allProfiles, setAllProfiles] = useState([]);
    const [nameValue, setNameValue] = useState('');
    const [urlValue, setUrlValue] = useState('');
    const [isPostingProfiles, setIsPostingProfiles] = useState(false);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    

    // Actions
    const getAllProfiles = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const linkedinPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          const profiles = await linkedinPortalContract.getAllProfiles();

          let profilesCleaned = [];
          profiles.forEach(profile => {
            profilesCleaned.push({
              address: profile.poster,
              timestamp: new Date(profile.timestamp * 1000),
              name: profile.name,
              url: profile.url
            });
          });
  
          setAllProfiles(profilesCleaned);
        } else {
          console.log("Ethereum object doesn't exist!")
        }
      } catch (error) {
        console.log(error);
      }
    }

    const checkIfWalletIsConnected = async () => {    
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }
        
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          setIsLoadingProfiles(true)
          getAllProfiles()
          setIsLoadingProfiles(false)
        } else {
          console.log("No authorized account found")
        }
      } catch (error) {
        console.log(error);
      }
    }
    
    const connectWallet = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        setIsLoadingProfiles(true)
           getAllProfiles()
        setIsLoadingProfiles(false) 
      } catch (error) {
        console.log(error)
      }
    }

    const postProfile = async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          setIsPostingProfiles(true)
          
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const linkedinPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let count = await linkedinPortalContract.getTotalProfiles();
          console.log("Retrieved total LinkedIn Profiles...", count.toNumber());

          const profileTxn = await linkedinPortalContract.postProfile(nameValue, urlValue, { gasLimit: 300000 });
          console.log("Mining...", profileTxn.hash);

          setNameValue("")
          setUrlValue("")

          await profileTxn.wait();
          console.log("Mined -- ", profileTxn.hash);

          setIsPostingProfiles(false)
          setIsLoadingProfiles(true)

          count = await linkedinPortalContract.getTotalProfiles();
          console.log("Retrieved total LinkedIn Profiles...", count.toNumber());

          await getAllProfiles()
          setIsLoadingProfiles(false)
          

        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
        setIsPostingProfiles(false)
        setIsLoadingProfiles(false)
      }
    }

    const onNameChange = (event) => {
      const { value } = event.target;
      setNameValue(value);
    };

    const onUrlChange = (event) => {
      const { value } = event.target;
      setUrlValue(value);
    };

    const renderNotConnectedContainer = () => (
      <button
        className="walletButton"
        onClick={connectWallet}
      >
        Connect MetaMask Wallet
      </button>
    );

    const renderIsNotPostingProfilesContainer = () => (
      <div className="connected-container">
        <div className="summary">
          Link your profile to the Metaverse
        </div>
        
        <form
          onSubmit={(event) => {
          event.preventDefault();
          postProfile(nameValue, urlValue);
          }}
        >

        <div>

          <input
              type="text"
              placeholder="Name"
              value={nameValue}
              onChange={onNameChange}
            />

            <input
              type="text"
              placeholder="URL"
              value={urlValue}
              onChange={onUrlChange}
            />

        </div>

          <button
            type="submit"
            className="profileButton"
          >
            Add LinkedIn
          </button>
            
        </form>

        

      </div>
    );

    const renderIsPostingProfilesContainer = () => (
      <div className="connected-container">
        <div className="summary">
          Syncing with the Metaverse, please wait...
        </div>
      </div>
    );

    const renderIsLoadingProfilesContainer = () => (
      <div className="connected-container">
        <div className="summary">
          Loading Meatlinked profiles...
        </div>
      </div>
    );

    const renderIsNotLoadingProfilesContainer = () => (
      <div className="connected-container">
        <br></br>

        <div className="profiles-header">
          MetaLinked Profiles
        </div>

        <br></br>

        <div className="profile-grid">

          {allProfiles.map((profile, index) => (

            <div className="profile-item" key={index}>
              <form action={profile.url}>
                <button 
                  className="profiles"
                  type="submit"
                >
                  {profile.name}
                </button>
              </form>

            </div>

          ))}

        </div>

      </div>
    );

    const renderConnectedContainer = () => (
      <div className="connected-container">     
        {!isPostingProfiles && renderIsNotPostingProfilesContainer()}
        {isPostingProfiles && renderIsPostingProfilesContainer()}
        {isLoadingProfiles && renderIsLoadingProfilesContainer()}
        {!isLoadingProfiles && renderIsNotLoadingProfilesContainer()}       
      </div>
    );

    // Use Effects
    useEffect(() => {
      console.log("Web 3.0 LinkedIn")
      checkIfWalletIsConnected();
    }, [])
  
  return (
    <div className="App">
      <div className="mainContainer">

        <div className="dataContainer">

          <div className="header">
          Web 3.0 LinkedIn
          </div>

          <br></br>

          {!currentAccount && renderNotConnectedContainer()}

          {currentAccount && renderConnectedContainer()}

        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>

      </div>
    </div>
  );
}

export default App
