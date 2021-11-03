import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import CustomInputField from '../utils/CustomInputField'
import {
    Button,
    Alert,
    AlertIcon,
    ModalFooter,
    VStack,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    Spacer,
    useDisclosure
} from '@chakra-ui/react'

const url = process.env.REACT_APP_ENDPOINT

const initialValues = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
}

const validationSchema = Yup.object().shape({
    email:  Yup.string()
                .email('Invalid email')
                .required('Required'),
    username: Yup.string()
                .required('Required'),
    password: Yup.string()
                .min(6,'Too short')
                .max(20,'Too long')
                .required('Required'),
    confirmPassword: Yup.string()
                        .oneOf([Yup.ref('password')], 'Must match password')
                        .required('Required')
})

export default function SignUp(props) {
    const [response, setResponse] = useState()
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    async function onSignUp(values) {
        const body = {
            email: values.email,
            password: values.confirmPassword,
            username: values.username,
        }

        var res = await fetch(`${url}/auth/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        res = await res.json()
        setResponse(res)
    }
    
    return (
        <>
        <Button {...props} onClick={onOpen}>Register</Button>
        <Modal motionPreset="slideInBottom" closeOnOverlayClick={false} isOpen={isOpen} isCentered
            onClose={() => {
                setResponse(null)
                onClose()
            }}
        >
            <ModalOverlay/>
            <ModalContent className="noselect" width="20rem" >
            <ModalCloseButton/>
            <ModalHeader align="center" justify="center" >Sign Up</ModalHeader>
            <ModalBody align="center" justify="center">
            {response && response.error && <Alert 
                w="fit-content"
                mb="1rem" 
                justify="center" 
                align="center"
                borderRadius="0.5rem"
                padding="0.5rem 1rem" 
                variant="solid" 
                status="error" 
            >
                <AlertIcon/>
                {response.error}
            </Alert>}
            {response && response.message && <Alert 
                w="fit-content"
                mb="1rem" 
                justify="center" 
                align="center"
                borderRadius="0.5rem"
                padding="0.5rem 1rem" 
                variant="solid" 
                status="success" 
            >
                <AlertIcon/>
                {response.message}
            </Alert>}
            <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={async (values, actions) => {
                    await onSignUp(values)
                    actions.setSubmitting(false)
                }}    
            >
                {({ errors, touched, isSubmitting, isValid }) => (
                <Form>
                    <VStack justify="center" align="center" w="12.5rem" >
                        <CustomInputField name="email" label="Email" error={errors.email} touched={touched.email} />
                        <CustomInputField name="username" label="Username" error={errors.username} touched={touched.username} />
                        <CustomInputField type="password" name="password" label="Password" error={errors.password} touched={touched.password} />
                        <CustomInputField type="password" name="confirmPassword" label="Confirm Password" error={errors.confirmPassword} touched={touched.confirmPassword} />
                        <Spacer/>
                        <Button
                            isLoading={isSubmitting}
                            isDisabled={!isValid} 
                            type="submit"
                            colorScheme="whatsapp"
                            size="md"
                            variant="solid"
                        >Sign Up</Button>
                    </VStack>
                </Form>
                )}
            </Formik>
            <ModalFooter/>
            </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}
