import { motion } from "framer-motion"
import BasicButton from "./BasicButton"
import { useState } from "react";

const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

const Dialog = ({ text, response }: { text: string, response: (ans: string) => string }) => {
    const [isVisible, setIsVisible] = useState<Boolean>(false);

    const onClick = (ans: string) => {
        response(ans);
        setIsVisible(false);
    }

    return (
        [<motion.div
            className="dialog"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <div><span style={{ fontSize: "2.2rem" }}>Caution!</span><br /><br />{text}</div>
            <div style={{ width: "80%", display: "flex", gap: "10px", justifyContent: "space-around", alignItems: "center" }}>
                <BasicButton text="いいえ" onClick={() => { onClick("no") }} />
                <BasicButton text="はい" onClick={() => { onClick("yes") }} />
            </div>
        </motion.div>, setIsVisible]
    )
}

export default Dialog