

import useRedirect from '@/app/hooks/useRedirect';
import { motion } from 'framer-motion';
import React from 'react';


export const DashboardButton = () => {
    const { status, goToDashboard } = useRedirect();
    return (
        <div>
            {(<motion.button onClick={goToDashboard}
            initial={{
                opacity: 0,
                scale: 0.98,
                filter: "blur(5px)",
            }}
            animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
            }}
            transition={{
                    duration: 0.3,
                    ease: "easeInOut",
            }}
            whileHover={{
                rotateX: 5,
                rotateY: 5,
                boxShadow: "0px 20px 50px rgba(76, 29, 149, 0.7)",
                y: -3,
            }}
            whileTap={{
                y: 0,
            }}
            
            style={{
                translateZ: 100,
            }}
            className='cursor-pointer group relative text-gray-400 px-12 py-4 rounded-lg bg-slate-900 shadow-[0px_1px_2px_0px_rgba(221,160,255, 0.1)_inset,0px_-1px_2px_0px_rgba(221,160,255, 0.1)_inset]'>
                <span className='group-hover:text-purple-400 transition-colors duration-300'>Enter Dashboard</span>
                <span className='absolute inset-x-0 bottom-px bg-gradient-to-r from-transparent via-purple-700 to-transparent h-px w-3/4 mx-auto'></span>
                <span className='absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 inset-x-0 bottom-px bg-gradient-to-r from-transparent via-purple-700 to-transparent h-[4px] w-full mx-auto blur-sm'></span>
            </motion.button>)}
        </div>
    )
}