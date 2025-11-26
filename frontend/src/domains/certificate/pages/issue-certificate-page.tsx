import * as React from 'react';
import { Box, Paper, TextField, Typography } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { PageContentHeader } from '@/components/page-content-header';
import { useWeb3Wallet } from '@/hooks/use-web3-wallet';
import { getCertificateContract } from '@/blockchain/certificate-registry';

const IssueCertificateSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  course: z.string().min(1),
  grade: z.string().min(1),
  description: z.string().min(1),
  completionDate: z.string().min(1) // yyyy-mm-dd
});

type IssueCertificateForm = z.infer<typeof IssueCertificateSchema>;

export const IssueCertificatePage: React.FC = () => {
  const { address, isConnected, connect } = useWeb3Wallet();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<IssueCertificateForm>({
    resolver: zodResolver(IssueCertificateSchema),
    defaultValues: {
      course: '',
      grade: '',
      description: '',
      completionDate: ''
    }
  });

  const onSubmit = async (values: IssueCertificateForm) => {
    try {
      if (!isConnected) {
        toast.error('Connect the wallet before issuing the certificate.');
        return;
      }

      const fakeCid = `ipfs://student-${values.studentId}-${Date.now()}`;

      const contract = await getCertificateContract();
      const tx = await contract.issueCertificate(values.studentId, fakeCid);
      const receipt = await tx.wait();

      toast.success(`Certificate issued! Tx: ${receipt?.hash ?? tx.hash}`);
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message ?? 'Error issuing certificate.');
    }
  };

  return (
    <>
      <PageContentHeader
        title='Issue On-chain Certificate'
        icon={<AddCircleOutline />}
        actions={[]}
      />
      <Box component={Paper} sx={{ p: 3 }}>
        <Box mb={2}>
          {!isConnected ? (
            <LoadingButton variant='contained' onClick={connect}>
              Conectar carteira (admin)
            </LoadingButton>
          ) : (
            <Typography variant='body2'>
              Carteira conectada: <strong>{address}</strong>
            </Typography>
          )}
        </Box>

        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'grid', gap: 2, maxWidth: 480 }}
        >
          <TextField
            label='Student ID'
            type='number'
            {...register('studentId')}
            error={!!errors.studentId}
            helperText={errors.studentId?.message}
          />
          <TextField
            label='Course'
            {...register('course')}
            error={!!errors.course}
            helperText={errors.course?.message}
          />
          <TextField
            label='Grade'
            {...register('grade')}
            error={!!errors.grade}
            helperText={errors.grade?.message}
          />
          <TextField
            label='Description'
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            label='Completion date'
            type='date'
            InputLabelProps={{ shrink: true }}
            {...register('completionDate')}
            error={!!errors.completionDate}
            helperText={errors.completionDate?.message}
          />

          <LoadingButton
            type='submit'
            variant='contained'
            loading={isSubmitting}
            sx={{ mt: 1 }}
          >
            Issue certificate
          </LoadingButton>
        </Box>
      </Box>
    </>
  );
};
