import { motion } from "framer-motion"

const StatusBar = ({ status, persent }: { status: string, persent: number }) => {
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
          {persent}%
        </motion.div>
      </div>
    );
};

export default StatusBar