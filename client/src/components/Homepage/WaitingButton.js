import React from 'react'
import {
    Popover,
    Portal,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
    Button,
    Heading,
    Spinner,
    HStack
} from '@chakra-ui/react'

export default function WaitingButton({ w, size, onClose, onTrigger, queueLength }) {
    return (
        <>
        <Popover flip={true} returnFocusOnClose={true} onClose={onClose} >
            <PopoverTrigger>
            <Button w={w} size={size} onClick={onTrigger}>Matchmaking</Button>
            </PopoverTrigger>
        <Portal>
            <PopoverContent w="fit-content" p="1rem 1.5rem" className="noselect" >
                <PopoverArrow/>
                <PopoverCloseButton/>
                <PopoverBody>
                    <HStack s="1rem">
                        <Spinner/>
                        <Heading size="md">{"Waiting, "+queueLength+" in Queue."}</Heading>
                    </HStack>
                </PopoverBody>
            </PopoverContent>
        </Portal>
        </Popover>
        </>
    )
}
