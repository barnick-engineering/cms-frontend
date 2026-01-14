import { Input } from "./input"

interface FloatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    field: any
}

export function FloatInput({ field, ...props }: FloatInputProps) {
    return (
        <Input
            {...props}
            type="text"
            inputMode="decimal"
            value={field.value ?? ''}
            onChange={(e) => {
                const val = e.target.value

                // allow empty
                if (val === '') {
                    field.onChange('')
                    return
                }

                // allow valid floats only
                if (/^\d*\.?\d*$/.test(val)) {
                    field.onChange(val)
                }
            }}
        />
    )
}