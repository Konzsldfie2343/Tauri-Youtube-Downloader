import { motion } from "framer-motion"

const StatusBar = ({ status, progress }: { status: string, progress: string }) => {
    return (
      <div className="status_wrapper">
        <motion.div
          className="status"
          whileHover={{ letterSpacing: "3px" }}
        >{status}</motion.div>
        <motion.div
          className="status"
          whileHover={{ letterSpacing: "10px" }}
        >
          {progress}
        </motion.div>
      </div>
    );
};

export default StatusBar