import React from 'react'
import { Field } from 'formik'
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input
} from '@chakra-ui/react'

export default function CustomInputField({ type, label, name, error, touched }) {
    return (
        <Field type={type} name={name}>
            {({ field }) => (
            <FormControl isInvalid={error && touched}>
                <FormLabel htmlFor={name}>{label}</FormLabel>
                <Input {...field} type={type} id={name} />
                <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
            )}
        </Field>
    )
}