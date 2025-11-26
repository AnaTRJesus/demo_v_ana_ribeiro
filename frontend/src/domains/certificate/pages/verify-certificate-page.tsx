import * as React from 'react';
import { Box, Paper, TextField, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';

import { PageContentHeader } from '@/components/page-content-header';
import { getCertificateContract } from '@/blockchain/certificate-registry';

export const VerifyCertificatePage: React.FC = () => {
  const [certId, setCertId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [cid, setCid] = React.useState('');
  const [result, setResult] = React.useState<null | boolean>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      setResult(null);

      const contract = await getCertificateContract();
      const isValid: boolean = await contract.verifyCertificate(
        Number(certId),
        Number(studentId),
        cid
      );

      setResult(isValid);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message ?? 'Erro ao verificar certificado');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <PageContentHeader
        title='Verificar Certificado On-chain'
        icon={<CheckCircleOutline />}
        actions={[]}
      />
      <Box component={Paper} sx={{ p: 3, maxWidth: 480 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label='Certificate ID'
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
          <TextField
            label='Student ID'
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <TextField
            label='CID usado na emissão'
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            helperText='Use exatamente o mesmo CID/string usado na emissão'
          />

          <LoadingButton
            variant='contained'
            loading={isVerifying}
            onClick={handleVerify}
          >
            Verificar
          </LoadingButton>

          {result !== null && (
            <Typography
              variant='body1'
              color={result ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {result ? 'Certificado VÁLIDO ✅' : 'Certificado INVÁLIDO ou revogado ❌'}
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};
