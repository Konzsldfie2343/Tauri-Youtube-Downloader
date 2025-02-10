import { motion } from "framer-motion"

const BasicButton = ({ text, onClick }: { text: string; onClick: () => void }) => {
    return (
      <motion.button
        className="base_button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}>
        {text}
      </motion.button>
    )
}

export default BasicButton