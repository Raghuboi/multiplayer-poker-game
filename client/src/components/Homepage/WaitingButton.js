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
	Text,
	Spinner,
	HStack,
	VStack,
} from '@chakra-ui/react'

export default function WaitingButton({
	w,
	size,
	onClose,
	onTrigger,
	queueLength,
}) {
	return (
		<>
			<Popover flip={true} returnFocusOnClose={true} onClose={onClose}>
				<PopoverTrigger>
					<Button w={w} size={size} onClick={onTrigger}>
						Matchmaking
					</Button>
				</PopoverTrigger>
				<Portal>
					<PopoverContent w='fit-content' p='1rem 1.5rem' className='noselect'>
						<PopoverArrow />
						<PopoverCloseButton />
						<PopoverBody>
							<VStack>
								<HStack s='1rem'>
									<Spinner />
									<Heading size='md'>
										{'Waiting, ' + queueLength + ' in Queue.'}
									</Heading>
								</HStack>
								{queueLength === 0 && (
									<Text size='sm'>
										Please be patient. The server can take upto 1 min to cold
										start.{' '}
									</Text>
								)}
							</VStack>
						</PopoverBody>
					</PopoverContent>
				</Portal>
			</Popover>
		</>
	)
}
