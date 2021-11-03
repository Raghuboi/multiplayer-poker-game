import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import CustomInputField from '../utils/CustomInputField'
import { Redirect } from 'react-router'
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    VStack,
    useDisclosure,
    Spacer
} from '@chakra-ui/react'

const initialValues = { room: '' }

const validationSchema = Yup.object().shape({
    room: Yup.string().required('Required').length(3, 'Room should be 3 letters long')
})


export default function GameCodeModal(props) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ roomCode, setRoomCode ] = useState()

    if (roomCode) return <Redirect to={`/play?roomCode=${roomCode}`}/>

    return (
        <>
        <Button {...props} onClick={onOpen}>Room Code</Button>
        <Modal motionPreset="slideInBottom" closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay/>
            <ModalContent className="noselect" width="20rem" padding="1.5rem" >
            <ModalCloseButton/>
            <ModalBody justify="center" align="center">
                <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={async ({ room }, { setSubmitting }) => {
                    await setRoomCode(room.toUpperCase())
                    setSubmitting(false)
                }}    
            >
                {({ errors, touched, isSubmitting, isValid }) => (
                <Form className="auth-form">
                    <VStack justify="center" align="center" w="12.5rem" >
                        <CustomInputField name="room" label="Room Code" error={errors.room} touched={touched.room} />
                        <Spacer/>
                        <Button
                            isLoading={isSubmitting}
                            isDisabled={!isValid} 
                            type="submit"
                            colorScheme="whatsapp"
                            size="md"
                            variant="solid"
                        >Join Room</Button>
                    </VStack>
                </Form>
                )}
            </Formik>
            </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}
