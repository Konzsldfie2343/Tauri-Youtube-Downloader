import BasicButton from "./BasicButton";

interface props {
    inputedURL: string;
    setInputedURL: (url: string) => void;
    addDownloadItem: (url: { url: string }) => void;
}

const URLInput = ({ inputedURL, setInputedURL, addDownloadItem}: props) => {
    return (
      <div className="url_input">
        <input type="text" className="url_input" placeholder="YoutubeのURLを入力" value={inputedURL} onChange={(e) => setInputedURL(e.target.value)} />
        <BasicButton text="追加" onClick={() => addDownloadItem({ url: inputedURL })} />
      </div>
    );
};

export default URLInput;