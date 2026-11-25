'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
  Input,
  Spinner,
  Badge,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { FiUploadCloud, FiTrash2, FiLink, FiCheck } from 'react-icons/fi';
import { uploadImageFile } from '@/lib/imageUpload';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  folder?: string;
  accentColor?: string;
  helperText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Imagem',
  folder = 'produtos',
  accentColor = 'brand.500',
  helperText = 'Formatos suportados: JPG, PNG, WEBP. A foto é otimizada automaticamente.',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo de imagem.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImageFile(file, folder);
      onChange(url);
      toast({
        title: 'Imagem carregada!',
        description: 'Foto pronta para ser salva.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      toast({
        title: 'Erro ao carregar imagem',
        description: 'Não foi possível processar o arquivo.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box w="100%">
      <Flex justify="space-between" align="center" mb={1.5}>
        <Text fontSize="xs" fontWeight="600" color="gray.300">
          {label}
        </Text>
        <Button
          size="2xs"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white' }}
          leftIcon={mode === 'upload' ? <FiLink size={11} /> : <FiUploadCloud size={11} />}
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
        >
          {mode === 'upload' ? 'Inserir via URL' : 'Fazer Upload'}
        </Button>
      </Flex>

      {/* Input de arquivo invisível */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {mode === 'url' ? (
        <Box>
          <Input
            placeholder="https://exemplo.com/foto.jpg"
            bg="#0b0d13"
            borderColor="#232936"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            fontSize="xs"
          />
        </Box>
      ) : (
        <Box>
          {value ? (
            <Box
              p={3.5}
              borderRadius="xl"
              bg="#0e111a"
              border="1px solid"
              borderColor="#232936"
            >
              <HStack spacing={{ base: 3, sm: 4 }} align={{ base: 'flex-start', sm: 'center' }}>
                {/* Thumbnail com clique rápido para trocar */}
                <Box
                  w={{ base: '68px', sm: '76px' }}
                  h={{ base: '68px', sm: '76px' }}
                  borderRadius="xl"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  flexShrink={0}
                  position="relative"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  role="group"
                  title="Clique na foto para trocar"
                >
                  <Image
                    src={value}
                    alt="Preview"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    fallbackSrc="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
                  />
                  {/* Overlay ao passar o mouse */}
                  <Flex
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.700"
                    align="center"
                    justify="center"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                  >
                    <FiUploadCloud size={18} color="#fff" />
                  </Flex>

                  {isUploading && (
                    <Flex
                      position="absolute"
                      inset={0}
                      bg="blackAlpha.800"
                      align="center"
                      justify="center"
                    >
                      <Spinner size="sm" color={accentColor} />
                    </Flex>
                  )}
                </Box>

                {/* Detalhes e Ações */}
                <VStack align="start" spacing={2} flex={1}>
                  <Box>
                    <Badge
                      colorScheme="green"
                      variant="subtle"
                      fontSize="2xs"
                      fontWeight="700"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      mb={1}
                    >
                      <HStack spacing={1}>
                        <FiCheck size={11} />
                        <Text>Foto Carregada</Text>
                      </HStack>
                    </Badge>
                    <Text fontSize="2xs" color="gray.400" noOfLines={1} maxW={{ base: '160px', sm: '240px' }}>
                      {value.startsWith('data:')
                        ? 'Arquivo otimizado do dispositivo'
                        : value}
                    </Text>
                  </Box>

                  <HStack spacing={2} pt={0.5} flexWrap="wrap">
                    <Button
                      size="sm"
                      h="34px"
                      fontSize="xs"
                      fontWeight="600"
                      borderRadius="lg"
                      bg="whiteAlpha.100"
                      color="white"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      _hover={{
                        bg: 'whiteAlpha.200',
                        borderColor: 'whiteAlpha.400',
                        color: 'white',
                      }}
                      leftIcon={<FiUploadCloud size={15} />}
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={isUploading}
                    >
                      Trocar Foto
                    </Button>

                    <IconButton
                      aria-label="Remover imagem"
                      icon={<FiTrash2 size={15} />}
                      size="sm"
                      h="34px"
                      w="34px"
                      colorScheme="red"
                      variant="ghost"
                      borderRadius="lg"
                      _hover={{ bg: 'red.900', color: 'red.200' }}
                      onClick={handleClearImage}
                      title="Remover foto"
                    />
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          ) : (
            <Box
              p={6}
              borderRadius="xl"
              bg="#0e111a"
              border="1px dashed"
              borderColor={isUploading ? accentColor : '#2b3140'}
              _hover={{ borderColor: accentColor, bg: 'whiteAlpha.50' }}
              cursor="pointer"
              textAlign="center"
              transition="all 0.2s"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <VStack spacing={2}>
                  <Spinner size="md" color={accentColor} />
                  <Text fontSize="xs" color="gray.300">
                    Processando imagem...
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={2}>
                  <Box
                    p={3}
                    borderRadius="xl"
                    bg="whiteAlpha.100"
                    color={accentColor}
                  >
                    <FiUploadCloud size={24} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="white">
                      Clique para escolher a foto
                    </Text>
                    <Text fontSize="2xs" color="gray.400" mt={0.5}>
                      Selecione do seu computador ou galeria do celular
                    </Text>
                  </Box>
                </VStack>
              )}
            </Box>
          )}
        </Box>
      )}

      {helperText && (
        <Text fontSize="2xs" color="gray.500" mt={1}>
          {helperText}
        </Text>
      )}
    </Box>
  );
}
