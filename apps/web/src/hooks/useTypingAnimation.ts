import { useEffect, useState } from 'react';

export default function useTypingAnimation(keywords: string[]): string {
    const [text, setText] = useState<string>(keywords[0] ?? '');
    const [typingState, setTypingState] = useState<'typing' | 'deleting'>('deleting');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const initialText = keywords[currentIndex] ?? '';

        if (typingState === 'typing' && text === initialText) {
            const id = setTimeout(() => {
                setTypingState('deleting');
            }, 1500);
            return () => clearTimeout(id);
        }

        if (typingState === 'deleting' && text === '') {
            setTypingState('typing');
            setCurrentIndex((i) => (i + 1) % keywords.length);
            return;
        }

        const id = setTimeout(
            () =>
                setText((prev) =>
                    typingState === 'deleting'
                        ? initialText.slice(0, prev.length - 1)
                        : initialText.slice(0, prev.length + 1),
                ),
            typingState === 'deleting' ? 30 : 60,
        );

        return () => clearTimeout(id);
    }, [typingState, currentIndex, text]);

    return text;
}
