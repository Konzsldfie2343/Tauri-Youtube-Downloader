const ProgressBar = ({ item_persent }: { item_persent: number }) => {
    return (
      <div className="progress_bar">
        <div className="progress" style={{ width: `${item_persent}%` }}></div>
      </div>
    );
};

export default ProgressBar