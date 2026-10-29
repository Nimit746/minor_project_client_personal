'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

/**
 * Optimized Typewriter Component
 *
 * Usage Examples:
 * <Typewriter text="Hello World" />
 * <Typewriter texts={["Hello", "World", "React"]} />
 * <Typewriter text="Delete me" deleteEffect />
 * <Typewriter text="Natural typing" naturalSpeed />
 * <Typewriter text="Fast" speed={30} />
 * <Typewriter text="Once only" loop={false} />
 */

const Typewriter = ({
    text,
    texts = [],
    speed = 80,
    deleteSpeed = 40,
    delay = 2000,
    deleteDelay = 1000,
    loop = true,
    deleteEffect = false,
    naturalSpeed = false,
    cursor = '|',
    cursorBlink = true,
    className = '',
    onComplete
}) => {
    const [displayText, setDisplayText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [textIndex, setTextIndex] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const timeoutRef = useRef(null)

    // Memoize the current target text
    const targetText = useMemo(() => {
        return texts.length > 0 ? texts[textIndex] : text
    }, [texts, textIndex, text])

    // Memoize whether we should cycle through multiple texts
    const isMultiText = texts.length > 0

    // Get natural typing speed variation
    const getTypingSpeed = () => {
        if (!naturalSpeed) return speed
        // Add natural variation: ±40% of base speed
        const variation = speed * 0.4
        return speed + (Math.random() * variation * 2 - variation)
    }

    useEffect(() => {
        if (!targetText || isComplete) return

        const type = () => {
            // Typing forward
            if (!isDeleting && displayText.length < targetText.length) {
                setDisplayText(targetText.slice(0, displayText.length + 1))
                timeoutRef.current = setTimeout(type, getTypingSpeed())
            }
            // Finished typing
            else if (!isDeleting && displayText.length === targetText.length) {
                // Check if we should delete
                if (deleteEffect || isMultiText) {
                    timeoutRef.current = setTimeout(() => {
                        setIsDeleting(true)
                        type()
                    }, delay)
                }
                // Check if we should restart single text
                else if (loop) {
                    timeoutRef.current = setTimeout(() => {
                        setDisplayText('')
                    }, delay)
                }
                // No loop, mark as complete
                else {
                    setIsComplete(true)
                    onComplete?.()
                }
            }
            // Deleting
            else if (isDeleting && displayText.length > 0) {
                setDisplayText(displayText.slice(0, -1))
                timeoutRef.current = setTimeout(type, deleteSpeed)
            }
            // Finished deleting
            else if (isDeleting && displayText.length === 0) {
                setIsDeleting(false)

                // Move to next text in array
                if (isMultiText) {
                    const nextIndex = (textIndex + 1) % texts.length
                    setTextIndex(nextIndex)

                    // If we've cycled through all and not looping, complete
                    if (!loop && nextIndex === 0) {
                        setIsComplete(true)
                        onComplete?.()
                    }
                }
                // Single text with delete effect
                else if (loop) {
                    timeoutRef.current = setTimeout(type, deleteDelay)
                }
                // No loop, complete
                else {
                    setIsComplete(true)
                    onComplete?.()
                }
            }
        }

        timeoutRef.current = setTimeout(type, getTypingSpeed())

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [displayText, isDeleting, targetText, textIndex, isComplete])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <span className={className}>
            {displayText}
            {!isComplete && (
                <span className={cursorBlink ? 'animate-pulse' : ''}>
                    {cursor}
                </span>
            )}
        </span>
    )
}

export default Typewriter
