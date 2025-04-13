import './ShareLink.css'


export default function ShareLink(){

    return(
        <>
            <div className="share-link-container">
                <h2>Share this link with your friends</h2>
                <input type="text" value={window.location.href} readOnly />
                <button onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy Link</button>
            </div>
        </>
    )
}